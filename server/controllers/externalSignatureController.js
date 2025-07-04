import ExternalSignature from '../models/ExternalSignature.js';
import Document from '../models/Document.js';
import User from '../models/User.js';
import Audit from '../models/Audit.js';
import sendEmail from '../utils/sendEmail.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontkit = (await import('fontkit')).default || (await import('fontkit'));
const dancingScriptRegularBytes = fs.readFileSync(path.join(__dirname, '../fonts/DancingScript-Regular.ttf'));
const dancingScriptBoldBytes = fs.readFileSync(path.join(__dirname, '../fonts/DancingScript-Bold.ttf'));

export const createExternalSignatureRequest = async (req, res) => {
    try {
        const { documentId, signerEmail, signerName, fields } = req.body;
        const requesterId = req.user.id;

        const document = await Document.findOne({ _id: documentId, user: requesterId });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        let externalSignature = await ExternalSignature.findOne({
            documentId,
            signerEmail,
            status: { $in: ['pending', 'sent'] }
        });

        if(externalSignature){
            externalSignature.generateNewToken();
            if(fields) externalSignature.fields = fields;
        } 
        else{
            externalSignature = new ExternalSignature({
                documentId,
                requesterId,
                signerEmail,
                signerName,
                ...(fields ? { fields } : {})
            });
        }

        await externalSignature.save();

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const tokenizedUrl = `${baseUrl}/external-sign/${externalSignature.token}`;

        const requester = await User.findById(requesterId);
        const emailSubject = `Signature Request from ${requester.name} via Docu-Signer`;
        const emailBody = `
            <div style="background-color: #f3f4f6; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="background-color: #0d9488; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Docu-Signer</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #1f2937; font-size: 20px;">You're Invited to Sign a Document</h2>
                        <p style="color: #4b5563; line-height: 1.6;">Hello ${signerName},</p>
                        <p style="color: #4b5563; line-height: 1.6;">
                            ${requester.name} (${requester.email}) has requested your signature on the document:
                            <br>
                            <strong>${document.originalname}</strong>
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${tokenizedUrl}" 
                               style="background-color: #0d9488; color: white; padding: 14px 28px; 
                                      text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
                                Review & Sign Document
                            </a>
                        </div>
                        <p style="color: #4b5563; line-height: 1.6;">
                            If the button doesn't work, you can copy and paste this link into your browser:
                            <br>
                            <a href="${tokenizedUrl}" style="color: #0d9488; text-decoration: none;">${tokenizedUrl}</a>
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0;">This link will expire in 7 days.</p>
                        <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply.</p>
                    </div>
                </div>
            </div>
        `;

        try{
            await sendEmail(signerEmail, emailSubject, emailBody);
            externalSignature.status = 'sent';
            await externalSignature.save();
        } 
        catch (emailError){
            console.error('Email sending failed:', emailError);
        }

        res.status(201).json({
            message: 'External signature request created successfully',
            tokenizedUrl,
            externalSignature: {
                id: externalSignature._id,
                signerEmail: externalSignature.signerEmail,
                signerName: externalSignature.signerName,
                status: externalSignature.status,
                expiresAt: externalSignature.expiresAt
            }
        });

    } 
    catch(error){
        console.error('Error creating external signature request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getExternalSigningDocument = async (req, res) => {
    try{
        const {token} = req.params;

        const externalSignature = await ExternalSignature.findOne({ token })
            .populate('documentId')
            .populate('requesterId', 'name email');

        if(!externalSignature){
            return res.status(404).json({ message: 'Invalid or expired signature link' });
        }

        if(externalSignature.isExpired()){
            externalSignature.status = 'expired';
            await externalSignature.save();
            return res.status(410).json({ message: 'Signature link has expired' });
        }

        if(externalSignature.status === 'signed'){
            return res.status(409).json({ message: 'Document has already been signed' });
        }

        res.json({
            document: externalSignature.documentId,
            fields: externalSignature.fields,
            signerInfo: {
                email: externalSignature.signerEmail,
                name: externalSignature.signerName
            },
            requester: externalSignature.requesterId,
            expiresAt: externalSignature.expiresAt
        });

    }
    catch(error){
        console.error('Error getting external signing document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitExternalSignature = async (req, res) => {
    try{
        const { token } = req.params;
        const { signatures } = req.body;

        if (!signatures || !Array.isArray(signatures) || signatures.length === 0) {
            return res.status(400).json({ message: 'Signatures are required.' });
        }

        const externalSignature = await ExternalSignature.findOne({ token })
            .populate('documentId');

        if (!externalSignature) {
            return res.status(404).json({ message: 'Invalid or expired signature link' });
        }

        const doc = externalSignature.documentId;
        if(!doc) {
            return res.status(404).json({ message: 'Original document not found.' });
        }

        if(externalSignature.isExpired()){
            externalSignature.status = 'expired';
            await externalSignature.save();
            return res.status(410).json({ message: 'Signature link has expired' });
        }

        if(externalSignature.status === 'signed'){
            return res.status(409).json({ message: 'Document has already been signed' });
        }

        const pdfPath = doc.path;
        const pdfBytes = fs.readFileSync(pdfPath);
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

        function getFont(fontStyle) {
            if (!fontStyle) return fonts.Helvetica;
            if (fontStyle.includes('Pacifico')) return fonts.PacificoRegular;
            if (fontStyle.includes('Caveat')) return fonts.CaveatRegular;
            if (fontStyle.includes('Sacramento')) return fonts.SacramentoRegular;
            if (fontStyle.includes('Dancing Script') && fontStyle.includes('Bold')) return fonts.DancingScriptBold;
            if (fontStyle.includes('Dancing Script')) return fonts.DancingScriptRegular;
            return fonts.Helvetica;
        }

        for (const signature of signatures) {
            const page = pdfDoc.getPage(signature.page - 1);
            const { height: pageHeight } = page.getSize();
            const y = pageHeight - signature.y; 
            const fontSize = signature.fontSize || 18;
            const color = signature.color ? rgb(signature.color.r, signature.color.g, signature.color.b) : rgb(0, 0, 0);
            const selectedFont = getFont(signature.fontStyle);
            const fontkitFont = selectedFont.font ? selectedFont.font : selectedFont.embedder.font;
            const layout = fontkitFont.layout(signature.content);
            const fontScale = fontSize / fontkitFont.unitsPerEm;
            let currentX = signature.x;
            for (let i = 0; i < layout.glyphs.length; i++) {
                const glyph = layout.glyphs[i];
                const position = layout.positions[i];
                const char = String.fromCodePoint(...glyph.codePoints);
                page.drawText(char, {
                    x: currentX + (position.xOffset * fontScale),
                    y: y - (position.yOffset*fontScale),
                    font: selectedFont,
                    size: fontSize,
                    color,
                });
                currentX += position.xAdvance*fontScale;
            }
        }

        const signedPdfBytes = await pdfDoc.save();
        const signedFilename = `${path.basename(doc.filename, '.pdf')}-signed-ext.pdf`;
        const signedPath = path.join(path.dirname(pdfPath), signedFilename);
        fs.writeFileSync(signedPath, signedPdfBytes);

        externalSignature.signedAt = new Date();
        externalSignature.status = 'signed';
        await externalSignature.save();

        doc.signedPath = signedPath;
        await doc.save();

        await Audit.create({
            documentId: doc._id,
            action: `Signed by external user (${externalSignature.signerEmail})`,
            ip: req.clientIp
        });

        res.json({
            message: 'Document signed successfully',
            signedAt: externalSignature.signedAt
        });

    } 
    catch(error) {
        console.error('Error submitting external signature:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const rejectSignature = async (req, res) => {
    try{
        const { token } = req.params;
        const { reason } = req.body;

        if(!reason){
            return res.status(400).json({ message: 'A reason for rejection is required.' });
        }

        const externalSignature = await ExternalSignature.findOne({ token });

        if(!externalSignature){
            return res.status(404).json({ message: 'Invalid or expired signature link' });
        }

        if(externalSignature.status === 'signed' || externalSignature.status === 'rejected') {
            return res.status(409).json({ message: `Document has already been ${externalSignature.status}.` });
        }

        externalSignature.status = 'rejected';
        externalSignature.rejectionReason = reason;
        await externalSignature.save();

        res.json({ message: 'You have successfully declined to sign.' });

    } 
    catch(error){
        console.error('Error rejecting signature:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getExternalSignatureRequests = async (req, res) => {
    try{
        const userId = req.user.id;

        const externalSignatures = await ExternalSignature.find({ requesterId: userId })
            .populate('documentId', 'originalname uploadedAt')
            .sort({ createdAt: -1 });

        const validRequests = externalSignatures.filter(request => request.documentId !== null);

        res.json(validRequests);

    } 
    catch(error){
        console.error('Error getting external signature requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resendExternalSignatureEmail = async (req, res) => {
    try {
        const { externalSignatureId } = req.params;
        const userId = req.user.id;

        const externalSignature = await ExternalSignature.findOne({
            _id: externalSignatureId,
            requesterId: userId
        }).populate('documentId');

        if (!externalSignature) {
            return res.status(404).json({ message: 'External signature request not found' });
        }

        if (!externalSignature.documentId) {
            return res.status(404).json({ message: 'Document not found' });
        }

        externalSignature.generateNewToken();
        await externalSignature.save();

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const tokenizedUrl = `${baseUrl}/external-sign/${externalSignature.token}`;

        const emailSubject = `Document Signature Request - ${externalSignature.documentId.originalname}`;
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Document Signature Request</h2>
                <p>Hello ${externalSignature.signerName},</p>
                <p>You have been requested to sign the document: <strong>${externalSignature.documentId.originalname}</strong></p>
                <p>Please click the button below to access and sign the document:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${tokenizedUrl}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        Sign Document
                    </a>
                </div>
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This link will expire in 7 days</li>
                    <li>You can sign the document without creating an account</li>
                    <li>If the button doesn't work, copy and paste this URL: ${tokenizedUrl}</li>
                </ul>
                <p>If you have any questions, please contact the document sender.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                    This is an automated message from Docu-Signer. Please do not reply to this email.
                </p>
            </div>
        `;

        try{
            await sendEmail(externalSignature.signerEmail, emailSubject, emailBody);
            externalSignature.status = 'sent';
            await externalSignature.save();
        } 
        catch (emailError){
            console.error('Email sending failed:', emailError);
            return res.status(500).json({ message: 'Failed to send email' });
        }

        res.json({
            message: 'Email sent successfully',
            tokenizedUrl,
            expiresAt: externalSignature.expiresAt
        });

    } 
    catch(error){
        console.error('Error resending external signature email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; 