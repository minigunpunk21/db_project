USE `issue_tracker`;
-- Demo passwords via SHA-256 (only for demo!)
UPDATE users SET password_hash = SHA2('alice123',256) WHERE login='alice';
UPDATE users SET password_hash = SHA2('carol123',256) WHERE login='carol';
UPDATE users SET password_hash = SHA2('dave123',256)  WHERE login='dave';
UPDATE users SET password_hash = SHA2('erin123',256)  WHERE login='erin';
