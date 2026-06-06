import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.app.core.config import settings

def send_rfq_email_to_vendor(vendor_email: str, vendor_name: str, rfq_title: str):
    """Send an email notification to a vendor about a new RFQ."""
    if not settings.SMTP_SERVER:
        print(f"Mock Email sending to {vendor_email}: New RFQ '{rfq_title}' assigned to you.")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = vendor_email
    msg['Subject'] = f"New RFQ Assigned: {rfq_title}"

    body = f"""
    Hello {vendor_name},

    You have been assigned to a new Request for Quotation (RFQ).
    
    RFQ Title: {rfq_title}
    
    Please log in to the VendorBridge portal to view the details and submit your quotation.

    Best regards,
    VendorBridge Procurement Team
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
