import Signature from '../models/Signature.js';
import Document from '../models/Document.js';
import Audit from '../models/Audit.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontkit = (await import('fontkit')).default || (await import('fontkit'));

export const finalizeAndEmbedSignatures = async (req, res, next) => {
    try {
        const { documentId, fields } = req.body;
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(400).json({ message: 'Signature fields are required.' });
        }

        const doc = await Document.findById(documentId);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const signatureDocs = fields.map(field => {
            const { id, ...rest } = field; 
            return {
                ...rest,
                documentId,
                userId: req.user.id,
            }
        });
        await Signature.insertMany(signatureDocs);

        const absoluteDocPath = path.isAbsolute(doc.path)
            ? doc.path
            : path.join(__dirname, '..', doc.path.replace(/^[\\/]+/, ''));
        const pdfBytes = fs.readFileSync(absoluteDocPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.registerFontkit(fontkit);

        const fontBytes = {
            DancingScriptRegular: fs.readFileSync(path.join(__dirname, '../fonts/DancingScript-Regular.ttf')),
            DancingScriptBold: fs.readFileSync(path.join(__dirname, '../fonts/DancingScript-Bold.ttf')),
            PacificoRegular: fs.readFileSync(path.join(__dirname, '../fonts/Pacifico-Regular.ttf')),
            CaveatRegular: fs.readFileSync(path.join(__dirname, '../fonts/Caveat-Regular.ttf')),
            SacramentoRegular: fs.readFileSync(path.join(__dirname, '../fonts/Sacramento-Regular.ttf')),
        };

        const fonts = {
            Helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
            DancingScriptRegular: await pdfDoc.embedFont(fontBytes.DancingScriptRegular),
            DancingScriptBold: await pdfDoc.embedFont(fontBytes.DancingScriptBold),
            PacificoRegular: await pdfDoc.embedFont(fontBytes.PacificoRegular),
            CaveatRegular: await pdfDoc.embedFont(fontBytes.CaveatRegular),
            SacramentoRegular: await pdfDoc.embedFont(fontBytes.SacramentoRegular),
        };

        function mapFontStyle(fontStyle) {
            if (!fontStyle) return fonts.Helvetica;
            if (fontStyle.includes('Pacifico')) return fonts.PacificoRegular;
            if (fontStyle.includes('Caveat')) return fonts.CaveatRegular;
            if (fontStyle.includes('Sacramento')) return fonts.SacramentoRegular;
            if (fontStyle.includes('Dancing Script') && fontStyle.includes('Bold')) return fonts.DancingScriptBold;
            if (fontStyle.includes('Dancing Script')) return fonts.DancingScriptRegular;
            return fonts.Helvetica;
        }

        for (const field of fields) {
            const page = pdfDoc.getPage(field.page - 1);
            const { height } = page.getSize();

            const invertedY = height - field.y;

            let color = rgb(0, 0, 0);
            if (field.color && typeof field.color.r === 'number' && typeof field.color.g === 'number' && typeof field.color.b === 'number') {
                color = rgb(field.color.r, field.color.g, field.color.b);
            }

            const selectedFont = mapFontStyle(field.fontStyle) || fonts.Helvetica;
            const fontSize = field.fontSize || 18;

            const fontkitFont = selectedFont.embedder.font;
            const layout = fontkitFont.layout(field.content);
            const fontScale = fontSize / fontkitFont.unitsPerEm;

            let currentX = field.x;

            for (let i = 0; i < layout.glyphs.length; i++) {
                const glyph = layout.glyphs[i];
                const position = layout.positions[i];
                const char = String.fromCodePoint(...glyph.codePoints);

                page.drawText(char, {
                    x: currentX + (position.xOffset * fontScale),
                    y: invertedY - (position.yOffset * fontScale),
                    font: selectedFont,
                    size: fontSize,
                    color,
                });
                currentX += position.xAdvance * fontScale;
            }
        }

        await Audit.create({
            documentId,
            userId: req.user.id,
            action: 'Signed by owner',
            ip: req.clientIp,
        });

        const signedPdfBytes = await pdfDoc.save();
        const normalizedDocPath = doc.path.replace(/\\/g, '/'); 
        const parsed = path.parse(normalizedDocPath);
        const signedFilename = parsed.name + '-signed' + parsed.ext;
        const signedPath = path.join(parsed.dir, signedFilename);
        const absoluteSignedPath = path.isAbsolute(signedPath)
            ? signedPath
            : path.join(__dirname, '..', signedPath.replace(/^[\\/]+/, ''));
        fs.writeFileSync(absoluteSignedPath, signedPdfBytes);

        doc.signedPath = signedPath;
        await doc.save();

        res.status(200).json({ message: 'Document signed successfully!', signedPath: `/uploads/${path.basename(signedPath)}` });

    } catch (err) {
        console.error("Error finalizing signatures:", err);
        next(err);
    }
};

export const sendSignatureLink = async (req, res, next) => {
    try {
        const { email, documentId } = req.body;
        const token = jwt.sign({ documentId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const link = `${process.env.CLIENT_URL}/sign/${documentId}?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Sign Document',
            html: `<p>Click <a href="${link}">here</a> to sign the document.</p>`
        });

        res.json({ message: 'Email sent' });
    } catch (err) { next(err); }
}; 