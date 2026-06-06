import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.app.core.config import settings

def send_rfq_email_to_vendor(vendor_email: str, vendor_name: str, rfq):
    """Send an email notification to a vendor about a new RFQ."""
    if not settings.SMTP_SERVER:
        print(f"Mock Email sending to {vendor_email}: New RFQ '{rfq.title}' assigned to you.")
        return

    msg = MIMEMultipart('alternative')
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = vendor_email
    msg['Subject'] = f"New RFQ Assigned: {rfq.title}"

    # Build product lines HTML
    product_lines_html = ""
    for line in rfq.lines:
        product_name = line.product.name if line.product else line.product_id
        product_lines_html += f'''
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{product_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{line.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{line.unit}</td>
        </tr>
        '''

    deadline_str = rfq.deadline.strftime('%b %d, %Y') if rfq.deadline else 'Not specified'
    quotation_link = "http://localhost:5173/vendor-quotations"

    html_body = f"""
    <html>
    <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2563EB; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New RFQ Assigned</h1>
            </div>
            <div style="padding: 20px; color: #334155;">
                <p style="font-size: 16px;">Hello <strong>{vendor_name}</strong>,</p>
                <p>You have been invited to submit a quotation for a new Request for Quotation (RFQ).</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">{rfq.title}</h2>
                    <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">Deadline: {deadline_str}</p>
                </div>

                <h3 style="color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Requested Items</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; text-align: left; font-size: 14px;">
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Product</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Quantity</th>
                            <th style="padding: 10px; border-bottom: 1px solid #cbd5e1;">Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {product_lines_html}
                    </tbody>
                </table>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{quotation_link}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View RFQ & Submit Quotation</a>
                </div>
                
                <p style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    Best regards,<br>
                    VendorBridge Procurement Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    text_body = f"""
    Hello {vendor_name},

    You have been assigned to a new Request for Quotation (RFQ).
    
    RFQ Title: {rfq.title}
    Deadline: {deadline_str}
    
    Please log in to the VendorBridge portal to view the details and submit your quotation:
    {quotation_link}

    Best regards,
    VendorBridge Procurement Team
    """

    msg.attach(MIMEText(text_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_FROM_EMAIL, vendor_email, text)
        server.quit()
        print(f"Email sent successfully to {vendor_email}")
    except Exception as e:
        print(f"Failed to send email to {vendor_email}: {e}")

def send_invoice_email_to_vendor(vendor_email: str, vendor_name: str, po_number: str, total_amount: float):
    """Send an invoice via email to a vendor/client."""
    if not settings.SMTP_SERVER:
        print(f"Mock Email sending to {vendor_email}: Invoice for PO '{po_number}' sent.")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = vendor_email
    msg['Subject'] = f"Invoice for Purchase Order: {po_number}"

    body = f"""
    Hello {vendor_name},

    Please find attached your invoice details for Purchase Order {po_number}.
    
    Total Amount: ₹{total_amount:.2f}
    
    You can log into VendorBridge to view and download the full PDF version of this invoice.

    Best regards,
    VendorBridge Finance Team
    """
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_FROM_EMAIL, vendor_email, text)
        server.quit()
        print(f"Invoice email sent successfully to {vendor_email}")
    except Exception as e:
        print(f"Failed to send invoice email to {vendor_email}: {e}")
