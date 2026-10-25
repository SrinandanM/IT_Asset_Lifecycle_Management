const cds = require('@sap/cds');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

class PDFService extends cds.ApplicationService {
    async init() {
        // Generate Asset Inventory Report
        this.on('READ', 'GenerateAssetReport', async (req) => {
            try {
                console.log("Generating Asset Report...");
                const db = cds.db;
                const assets = await db.run(
                    SELECT.from('Assets').limit(100)
                );

                const pdf = await this._generateAssetInventoryPDF(assets);
                return {
                    content: pdf.toString('base64'),
                    filename: `asset-inventory-${Date.now()}.pdf`,
                    type: 'application/pdf'
                };
            } catch (error) {
                console.error("Error generating report:", error);
                req.error(500, `PDF Generation Failed: ${error.message}`);
            }
        });

        // Download Report
        this.on('READ', 'DownloadReport', async (req) => {
            try {
                const { reportType } = req.data;
                console.log("Downloading report:", reportType);

                const db = cds.db;
                let data = [];
                let title = "";

                if (reportType === 'assetInventory') {
                    data = await db.run(SELECT.from('Assets'));
                    title = "Asset Inventory Report";
                } else if (reportType === 'employees') {
                    data = await db.run(SELECT.from('Employees'));
                    title = "Employee Report";
                } else if (reportType === 'requests') {
                    data = await db.run(SELECT.from('AssetRequests'));
                    title = "Asset Request Report";
                }

                const pdf = await this._generateReportPDF(title, data);

                return {
                    content: pdf.toString('base64'),
                    filename: `${reportType}-${Date.now()}.pdf`,
                    type: 'application/pdf'
                };
            } catch (error) {
                console.error("Download error:", error);
                req.error(500, `Download Failed: ${error.message}`);
            }
        });

        // Share Report via Email
        this.on('CREATE', 'ShareReport', async (req) => {
            const { email, reportType } = req.data;

            try {
                console.log("Sharing report to:", email, "Type:", reportType);

                if (!email || !email.includes('@')) {
                    req.error(400, "Invalid email address");
                    return;
                }

                const db = cds.db;
                let data = [];
                let title = "";

                if (reportType === 'assetInventory') {
                    data = await db.run(SELECT.from('Assets'));
                    title = "Asset Inventory Report";
                } else if (reportType === 'employees') {
                    data = await db.run(SELECT.from('Employees'));
                    title = "Employee Report";
                } else if (reportType === 'requests') {
                    data = await db.run(SELECT.from('AssetRequests'));
                    title = "Asset Request Report";
                }

                const pdf = await this._generateReportPDF(title, data);

                // Send email
                const result = await this._sendEmail(email, pdf, reportType);

                return {
                    success: true,
                    message: `Report sent to ${email}`,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error("Share error:", error);
                req.error(500, `Failed to share: ${error.message}`);
            }
        });

        await super.init();
    }

    async _generateReportPDF(title, data) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            doc.on('error', reject);

            try {
                // Header
                doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.fontSize(10).font('Helvetica').text(
                    `Generated: ${new Date().toLocaleString()}`,
                    { align: 'center' }
                );
                doc.moveDown();

                // Table Header
                const pageWidth = doc.page.width - 100;
                const columnWidth = pageWidth / 4;
                let xPosition = 50;
                let yPosition = doc.y;

                doc.fontSize(9).font('Helvetica-Bold');
                
                // Draw header row
                const columns = this._getColumns(data);
                columns.forEach((col, idx) => {
                    doc.text(col, xPosition + (idx * columnWidth), yPosition, {
                        width: columnWidth - 10,
                        ellipsis: true
                    });
                });

                // Separator line
                doc.moveTo(50, yPosition + 15).lineTo(550, yPosition + 15).stroke();
                yPosition += 25;

                // Data rows
                doc.font('Helvetica').fontSize(8);
                const maxRows = Math.min(data.length, 50); // Limit to 50 rows

                for (let i = 0; i < maxRows; i++) {
                    if (yPosition > doc.page.height - 50) {
                        doc.addPage();
                        yPosition = 50;
                    }

                    const row = data[i];
                    const values = this._getRowValues(row, columns);

                    values.forEach((val, idx) => {
                        doc.text(
                            String(val || '-').substring(0, 30),
                            xPosition + (idx * columnWidth),
                            yPosition,
                            {
                                width: columnWidth - 10,
                                ellipsis: true
                            }
                        );
                    });

                    yPosition += 15;
                }

                // Footer
                doc.fontSize(8).text(
                    `Total Records: ${data.length}`,
                    50,
                    doc.page.height - 30
                );

                doc.end();
            } catch (error) {
                doc.end();
                reject(error);
            }
        });
    }

    async _generateAssetInventoryPDF(assets) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            try {
                // Title
                doc.fontSize(24).font('Helvetica-Bold').text('Asset Inventory Report', { align: 'center' });
                doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
                doc.moveDown();

                // Summary
                doc.fontSize(12).font('Helvetica-Bold').text('Summary');
                doc.fontSize(10).font('Helvetica');
                doc.text(`Total Assets: ${assets.length}`);
                
                const available = assets.filter(a => a.status === 'AVAILABLE').length;
                const assigned = assets.filter(a => a.status === 'ASSIGNED').length;
                const maintenance = assets.filter(a => a.status === 'MAINTENANCE').length;
                
                doc.text(`Available: ${available}`);
                doc.text(`Assigned: ${assigned}`);
                doc.text(`In Maintenance: ${maintenance}`);
                doc.moveDown();

                // Asset Details Table
                doc.fontSize(12).font('Helvetica-Bold').text('Asset Details');
                doc.fontSize(9).font('Helvetica-Bold');

                const columns = ['Asset Tag', 'Model', 'Status', 'Serial'];
                const colWidth = (doc.page.width - 100) / 4;
                
                let yPos = doc.y;
                columns.forEach((col, idx) => {
                    doc.text(col, 50 + (idx * colWidth), yPos, { width: colWidth - 10 });
                });

                doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();
                yPos += 25;

                doc.font('Helvetica').fontSize(8);

                assets.slice(0, 30).forEach(asset => {
                    if (yPos > doc.page.height - 50) {
                        doc.addPage();
                        yPos = 50;
                    }

                    doc.text(asset.assetTag || '-', 50, yPos, { width: colWidth - 10 });
                    doc.text(asset.model || '-', 50 + colWidth, yPos, { width: colWidth - 10 });
                    doc.text(asset.status || '-', 50 + (colWidth * 2), yPos, { width: colWidth - 10 });
                    doc.text(asset.serialNumber || '-', 50 + (colWidth * 3), yPos, { width: colWidth - 10 });

                    yPos += 15;
                });

                // Footer
                doc.fontSize(8).text(
                    `Page 1 | Total: ${assets.length} assets`,
                    50,
                    doc.page.height - 30
                );

                doc.end();
            } catch (error) {
                doc.end();
                reject(error);
            }
        });
    }

    _getColumns(data) {
        if (!data || data.length === 0) return ['No Data'];
        const firstItem = data[0];
        return Object.keys(firstItem).slice(0, 4);
    }

    _getRowValues(row, columns) {
        return columns.map(col => {
            const val = row[col];
            if (typeof val === 'object') return JSON.stringify(val);
            if (typeof val === 'string' && val.length > 30) return val.substring(0, 27) + '...';
            return val;
        });
    }

    async _sendEmail(email, pdfBuffer, reportType) {
        try {
            // Get email config from env or use defaults
            const mailHost = process.env.MAIL_HOST || 'smtp.gmail.com';
            const mailPort = process.env.MAIL_PORT || 587;
            const mailUser = process.env.MAIL_USER;
            const mailPass = process.env.MAIL_PASS;
            const mailFrom = process.env.MAIL_FROM || 'noreply@company.com';

            // If no credentials, just log and return success
            if (!mailUser || !mailPass) {
                console.log("Email credentials not configured. Skipping send.");
                return { success: true, skipped: true };
            }

            const transporter = nodemailer.createTransport({
                host: mailHost,
                port: mailPort,
                secure: mailPort === 465,
                auth: {
                    user: mailUser,
                    pass: mailPass
                }
            });

            const mailOptions = {
                from: mailFrom,
                to: email,
                subject: `Asset Management Report: ${reportType}`,
                text: 'Please see the attached report.',
                html: `
                    <h2>Asset Management Report</h2>
                    <p>Please find the ${reportType} report attached.</p>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                `,
                attachments: [{
                    filename: `${reportType}-${Date.now()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }]
            };

            console.log("Sending email to:", email);
            const result = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", result.messageId);
            return result;
        } catch (error) {
            console.error("Email send error:", error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = PDFService;
