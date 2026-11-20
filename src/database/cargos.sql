USE traveline;

INSERT INTO cargo (cargo) VALUES ('Administrador'), ('Gerente'), ('Analista')
ON DUPLICATE KEY UPDATE cargo = VALUES(cargo);
