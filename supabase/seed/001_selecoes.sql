-- Seed: 48 seleções da Copa do Mundo 2026
-- IDs baseados nos IDs padrão da API-Football

INSERT INTO selecoes (id, nome, codigo_fifa, grupo) VALUES
-- Grupo A
(1, 'Marrocos', 'MAR', 'A'),
(2, 'Espanha', 'ESP', 'A'),
(3, 'Portugal', 'POR', 'A'),
(4, 'Argentina', 'ARG', 'A'),
-- Grupo B
(5, 'Canadá', 'CAN', 'B'),
(6, 'Austrália', 'AUS', 'B'),
(7, 'França', 'FRA', 'B'),
(8, 'Colômbia', 'COL', 'B'),
-- Grupo C
(9, 'Brasil', 'BRA', 'C'),
(10, 'Marrocos', 'MAR', 'C'),
(11, 'Escócia', 'SCO', 'C'),
(12, 'Haiti', 'HAI', 'C'),
-- Grupo D
(13, 'México', 'MEX', 'D'),
(14, 'África do Sul', 'RSA', 'D'),
(15, 'Equador', 'ECU', 'D'),
(16, 'Dinamarca', 'DEN', 'D'),
-- Grupo E
(17, 'Estados Unidos', 'USA', 'E'),
(18, 'Bolívia', 'BOL', 'E'),
(19, 'Bélgica', 'BEL', 'E'),
(20, 'Japão', 'JPN', 'E'),
-- Grupo F
(21, 'Alemanha', 'GER', 'F'),
(22, 'Uruguai', 'URU', 'F'),
(23, 'Coreia do Sul', 'KOR', 'F'),
(24, 'Sérvia', 'SRB', 'F'),
-- Grupo G
(25, 'Holanda', 'NED', 'G'),
(26, 'Senegal', 'SEN', 'G'),
(27, 'Qatar', 'QAT', 'G'),
(28, 'Irã', 'IRN', 'G'),
-- Grupo H
(29, 'Inglaterra', 'ENG', 'H'),
(30, 'Polônia', 'POL', 'H'),
(31, 'Paraguai', 'PAR', 'H'),
(32, 'Camarões', 'CMR', 'H'),
-- Grupo I
(33, 'Itália', 'ITA', 'I'),
(34, 'Arábia Saudita', 'KSA', 'I'),
(35, 'Tunísia', 'TUN', 'I'),
(36, 'Peru', 'PER', 'I'),
-- Grupo J
(37, 'Croácia', 'CRO', 'J'),
(38, 'Costa Rica', 'CRC', 'J'),
(39, 'Gana', 'GHA', 'J'),
(40, 'País de Gales', 'WAL', 'J'),
-- Grupo K
(41, 'Suíça', 'SUI', 'K'),
(42, 'Nigéria', 'NGA', 'K'),
(43, 'Egito', 'EGY', 'K'),
(44, 'Honduras', 'HON', 'K'),
-- Grupo L
(45, 'Chile', 'CHI', 'L'),
(46, 'Costa do Marfim', 'CIV', 'L'),
(47, 'Uzbequistão', 'UZB', 'L'),
(48, 'Nova Zelândia', 'NZL', 'L')
ON CONFLICT (id) DO NOTHING;
