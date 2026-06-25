-- FAQ Chatbot Database Schema
-- Run this SQL script to create the necessary tables

-- Create the faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create an index on category for faster filtering (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- Insert sample FAQ data for testing
INSERT INTO faqs (question, answer, category) VALUES
('What is a NOC?', 'A NOC (No Objection Certificate) is a document required from your college/university to confirm they have no objection to your internship. You need to submit this before starting your internship.', 'NOC'),
('How do I submit my NOC?', 'You can submit your NOC through the VINS portal under the Documents section. Upload a scanned copy in PDF format. The document will be verified by the admin within 2-3 business days.', 'NOC'),
('What is ViBe?', 'ViBe is the Vincular Benefits program that provides various perks and benefits to interns, including learning resources, mentorship sessions, and networking opportunities.', 'ViBe'),
('How do I access ViBe benefits?', 'Once your internship is confirmed, you will receive an email with access to the ViBe portal. Log in using your VINS credentials to explore and claim your benefits.', 'ViBe'),
('What are Spurti Points?', 'Spurti Points are reward points you earn for completing tasks, attending sessions, and actively participating in internship activities. These points can be redeemed for certificates, gifts, and other rewards.', 'Spurti Points'),
('How do I earn Spurti Points?', 'You can earn Spurti Points by: completing weekly assignments (10 points), attending webinars (5 points), submitting project milestones (20 points), and referring other students (15 points).', 'Spurti Points'),
('When does the internship start?', 'Internship start dates vary based on your joining batch. You will receive a confirmation email with your specific start date at least one week before commencement.', 'Internship'),
('What is the duration of the internship?', 'Most internships last between 8 to 12 weeks, depending on the program you enrolled in. The exact duration is mentioned in your offer letter.', 'Internship'),
('Can I work remotely during the internship?', 'Yes, most VINS internships are remote-friendly. However, some roles may require hybrid or on-site presence. Check your offer letter or contact HR for specific details about your position.', 'Internship'),
('Who do I contact for technical issues?', 'For technical issues with the VINS portal or any software, please email support@vins.com or raise a ticket through the Help section in your dashboard. Our support team responds within 24 hours.', 'Support');
