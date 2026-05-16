import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { TransactionDocument } from './fee.schema';
import { Response } from 'express';

@Injectable()
export class InvoiceService {
    async generateInvoice(transaction: any, res: Response): Promise<void> {
        const doc = new PDFDocument({ margin: 50 });

        // Pipe its output to the response
        doc.pipe(res);

        // Header
        this.generateHeader(doc, transaction.universityId);
        this.generateCustomerInformation(doc, transaction);
        this.generateInvoiceTable(doc, transaction);
        this.generateFooter(doc);

        doc.end();
    }

    private generateHeader(doc: any, university: any) {
        doc.fillColor('#444444')
            .fontSize(20)
            .text('EduCore University ERP', 110, 57)
            .fontSize(10)
            .text('123 University Lane', 200, 65, { align: 'right' })
            .text('City, State, Zip', 200, 80, { align: 'right' })
            .moveDown();
    }

    private generateCustomerInformation(doc: any, transaction: any) {
        doc.fillColor('#444444').fontSize(20).text('Fee Receipt', 50, 160);

        this.generateHr(doc, 185);

        const customerInformationTop = 200;

        doc.fontSize(10)
            .text('Transaction ID:', 50, customerInformationTop)
            .font('Helvetica-Bold')
            .text(transaction.transactionId || transaction.razorpayPaymentId || 'N/A', 150, customerInformationTop)
            .font('Helvetica')
            .text('Date:', 50, customerInformationTop + 15)
            .text(new Date().toLocaleDateString(), 150, customerInformationTop + 15)
            .text('Amount Due:', 50, customerInformationTop + 30)
            .text(`INR ${transaction.amount}`, 150, customerInformationTop + 30)

            .font('Helvetica-Bold')
            .text(transaction.studentId?.userId?.name || 'Student Name', 300, customerInformationTop)
            .font('Helvetica')
            .text(transaction.studentId?.enrollmentNo || 'Enrollment No', 300, customerInformationTop + 15)
            .text(`${transaction.studentId?.departmentId?.name || 'Department'}`, 300, customerInformationTop + 30)
            .moveDown();

        this.generateHr(doc, 252);
    }

    private generateInvoiceTable(doc: any, transaction: any) {
        let i;
        const invoiceTableTop = 330;

        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            invoiceTableTop,
            'Item',
            'Description',
            'Unit Cost',
            'Quantity',
            'Total'
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        const position = invoiceTableTop + 30;
        this.generateTableRow(
            doc,
            position,
            transaction.feeId?.name || 'Fee',
            transaction.feeId?.description || 'Academic Fee',
            `INR ${transaction.amount}`,
            '1',
            `INR ${transaction.amount}`
        );

        this.generateHr(doc, position + 20);

        const subtotalPosition = position + 30;
        this.generateTableRow(
            doc,
            subtotalPosition,
            '',
            '',
            'Subtotal',
            '',
            `INR ${transaction.amount}`
        );

        const paidPosition = subtotalPosition + 20;
        this.generateTableRow(
            doc,
            paidPosition,
            '',
            '',
            'Amount Paid',
            '',
            `INR ${transaction.amountPaid}`
        );

        const duePosition = paidPosition + 25;
        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            duePosition,
            '',
            '',
            'Balance Due',
            '',
            `INR ${transaction.amount - transaction.amountPaid}`
        );
        doc.font('Helvetica');
    }

    private generateFooter(doc: any) {
        doc.fontSize(10).text(
            'This is a computer generated receipt and does not require a signature.',
            50,
            780,
            { align: 'center', width: 500 }
        );
    }

    private generateTableRow(
        doc: any,
        y: number,
        item: string,
        description: string,
        unitCost: string,
        quantity: string,
        lineTotal: string
    ) {
        doc.fontSize(10)
            .text(item, 50, y)
            .text(description, 150, y)
            .text(unitCost, 280, y, { width: 90, align: 'right' })
            .text(quantity, 370, y, { width: 90, align: 'right' })
            .text(lineTotal, 0, y, { align: 'right' });
    }

    private generateHr(doc: any, y: number) {
        doc.strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }
}
