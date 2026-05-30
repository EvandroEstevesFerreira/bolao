-- Atualizar seleções com dados oficiais da Copa 2026
-- Upsert com os grupos corretos do sorteio oficial

INSERT INTO selecoes (id, nome, codigo_fifa, grupo) VALUES
-- Grupo A
(1, 'Mexico', 'MEX', 'A'),
(2, 'South Africa', 'RSA', 'A'),
(3, 'South Korea', 'KOR', 'A'),
(4, 'Czechia', 'CZE', 'A'),
-- Grupo B
(5, 'Canada', 'CAN', 'B'),
(6, 'Bosnia & Herzegovina', 'BIH', 'B'),
(7, 'Qatar', 'QAT', 'B'),
(8, 'Switzerland', 'SUI', 'B'),
-- Grupo C
(9, 'Brazil', 'BRA', 'C'),
(10, 'Morocco', 'MOR', 'C'),
(11, 'Haiti', 'HAI', 'C'),
(12, 'Scotland', 'SCO', 'C'),
-- Grupo D
(13, 'USA', 'USA', 'D'),
(14, 'Paraguay', 'PAR', 'D'),
(15, 'Australia', 'AUS', 'D'),
(16, 'Türkiye', 'TUR', 'D'),
-- Grupo E
(17, 'Germany', 'GER', 'E'),
(18, 'Curaçao', 'CUR', 'E'),
(19, 'Côte d''Ivoire', 'CIV', 'E'),
(20, 'Ecuador', 'ECU', 'E'),
-- Grupo F
(21, 'Netherlands', 'NED', 'F'),
(22, 'Japan', 'JPN', 'F'),
(23, 'Sweden', 'SWE', 'F'),
(24, 'Tunisia', 'TUN', 'F'),
-- Grupo G
(25, 'Belgium', 'BEL', 'G'),
(26, 'Egypt', 'EGY', 'G'),
(27, 'Iran', 'IRI', 'G'),
(28, 'New Zealand', 'NZL', 'G'),
-- Grupo H
(29, 'Spain', 'ESP', 'H'),
(30, 'Cabo Verde', 'CPV', 'H'),
(31, 'Saudi Arabia', 'KSA', 'H'),
(32, 'Uruguay', 'URU', 'H'),
-- Grupo I
(33, 'France', 'FRA', 'I'),
(34, 'Senegal', 'SEN', 'I'),
(35, 'Iraq', 'IRA', 'I'),
(36, 'Norway', 'NOR', 'I'),
-- Grupo J
(37, 'Argentina', 'ARG', 'J'),
(38, 'Algeria', 'DZA', 'J'),
(39, 'Austria', 'AUT', 'J'),
(40, 'Jordan', 'JOR', 'J'),
-- Grupo K
(41, 'Portugal', 'POR', 'K'),
(42, 'DR Congo', 'DCO', 'K'),
(43, 'Uzbekistan', 'UZB', 'K'),
(44, 'Colombia', 'COL', 'K'),
-- Grupo L
(45, 'England', 'ENG', 'L'),
(46, 'Croatia', 'CRO', 'L'),
(47, 'Ghana', 'GHA', 'L'),
(48, 'Panama', 'PAN', 'L')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  codigo_fifa = EXCLUDED.codigo_fifa,
  grupo = EXCLUDED.grupo;
