-- Seed: Partidas da fase de grupos (exemplo com jogos iniciais)
-- Na produção, usar API-Football para popular com IDs reais
-- Aqui usamos IDs sequenciais como placeholder

-- RODADA 1 — 11/06/2026
INSERT INTO partidas (id, rodada, fase, grupo, data_hora, selecao_casa_id, selecao_fora_id, estadio, cidade, status) VALUES
(1001, 'Rodada 1', 'grupos', 'D', '2026-06-11T18:00:00-03:00', 13, 14, 'Estádio Azteca', 'Cidade do México', 'agendado'),
-- Jogos do Grupo C (Brasil)
(1002, 'Rodada 1', 'grupos', 'C', '2026-06-12T16:00:00-03:00', 9, 10, 'AT&T Stadium', 'Dallas', 'agendado'),
(1003, 'Rodada 1', 'grupos', 'C', '2026-06-12T13:00:00-03:00', 11, 12, 'MetLife Stadium', 'Nova York', 'agendado'),
-- Grupo A
(1004, 'Rodada 1', 'grupos', 'A', '2026-06-12T19:00:00-03:00', 1, 2, 'Hard Rock Stadium', 'Miami', 'agendado'),
(1005, 'Rodada 1', 'grupos', 'A', '2026-06-12T22:00:00-03:00', 3, 4, 'SoFi Stadium', 'Los Angeles', 'agendado'),
-- Grupo B
(1006, 'Rodada 1', 'grupos', 'B', '2026-06-13T16:00:00-03:00', 5, 6, 'BMO Field', 'Toronto', 'agendado'),
(1007, 'Rodada 1', 'grupos', 'B', '2026-06-13T19:00:00-03:00', 7, 8, 'Lincoln Financial Field', 'Filadélfia', 'agendado'),
-- Grupo D
(1008, 'Rodada 1', 'grupos', 'D', '2026-06-13T22:00:00-03:00', 15, 16, 'Estádio Azteca', 'Cidade do México', 'agendado'),
-- Grupo E
(1009, 'Rodada 1', 'grupos', 'E', '2026-06-14T16:00:00-03:00', 17, 18, 'Rose Bowl', 'Los Angeles', 'agendado'),
(1010, 'Rodada 1', 'grupos', 'E', '2026-06-14T19:00:00-03:00', 19, 20, 'Lumen Field', 'Seattle', 'agendado'),
-- Grupo F
(1011, 'Rodada 1', 'grupos', 'F', '2026-06-14T22:00:00-03:00', 21, 22, 'Mercedes-Benz Stadium', 'Atlanta', 'agendado'),
(1012, 'Rodada 1', 'grupos', 'F', '2026-06-15T16:00:00-03:00', 23, 24, 'NRG Stadium', 'Houston', 'agendado'),
-- Grupo G
(1013, 'Rodada 1', 'grupos', 'G', '2026-06-15T19:00:00-03:00', 25, 26, 'MetLife Stadium', 'Nova York', 'agendado'),
(1014, 'Rodada 1', 'grupos', 'G', '2026-06-15T22:00:00-03:00', 27, 28, 'Hard Rock Stadium', 'Miami', 'agendado'),
-- Grupo H
(1015, 'Rodada 1', 'grupos', 'H', '2026-06-16T16:00:00-03:00', 29, 30, 'Wembley... SoFi Stadium', 'Los Angeles', 'agendado'),
(1016, 'Rodada 1', 'grupos', 'H', '2026-06-16T19:00:00-03:00', 31, 32, 'AT&T Stadium', 'Dallas', 'agendado'),
-- Grupo I
(1017, 'Rodada 1', 'grupos', 'I', '2026-06-16T22:00:00-03:00', 33, 34, 'Lincoln Financial Field', 'Filadélfia', 'agendado'),
(1018, 'Rodada 1', 'grupos', 'I', '2026-06-17T16:00:00-03:00', 35, 36, 'BMO Field', 'Toronto', 'agendado'),
-- Grupo J
(1019, 'Rodada 1', 'grupos', 'J', '2026-06-17T19:00:00-03:00', 37, 38, 'Mercedes-Benz Stadium', 'Atlanta', 'agendado'),
(1020, 'Rodada 1', 'grupos', 'J', '2026-06-17T22:00:00-03:00', 39, 40, 'NRG Stadium', 'Houston', 'agendado'),
-- Grupo K
(1021, 'Rodada 1', 'grupos', 'K', '2026-06-18T16:00:00-03:00', 41, 42, 'Rose Bowl', 'Los Angeles', 'agendado'),
(1022, 'Rodada 1', 'grupos', 'K', '2026-06-18T19:00:00-03:00', 43, 44, 'Lumen Field', 'Seattle', 'agendado'),
-- Grupo L
(1023, 'Rodada 1', 'grupos', 'L', '2026-06-18T22:00:00-03:00', 45, 46, 'Estádio Azteca', 'Cidade do México', 'agendado'),
(1024, 'Rodada 1', 'grupos', 'L', '2026-06-19T16:00:00-03:00', 47, 48, 'Hard Rock Stadium', 'Miami', 'agendado'),

-- RODADA 2
(1025, 'Rodada 2', 'grupos', 'D', '2026-06-19T19:00:00-03:00', 14, 15, 'Estádio Azteca', 'Cidade do México', 'agendado'),
(1026, 'Rodada 2', 'grupos', 'D', '2026-06-19T22:00:00-03:00', 13, 16, 'NRG Stadium', 'Houston', 'agendado'),
(1027, 'Rodada 2', 'grupos', 'C', '2026-06-20T16:00:00-03:00', 10, 11, 'AT&T Stadium', 'Dallas', 'agendado'),
(1028, 'Rodada 2', 'grupos', 'C', '2026-06-20T19:00:00-03:00', 9, 12, 'MetLife Stadium', 'Nova York', 'agendado'),
(1029, 'Rodada 2', 'grupos', 'A', '2026-06-20T22:00:00-03:00', 2, 3, 'SoFi Stadium', 'Los Angeles', 'agendado'),
(1030, 'Rodada 2', 'grupos', 'A', '2026-06-21T16:00:00-03:00', 4, 1, 'Hard Rock Stadium', 'Miami', 'agendado'),
(1031, 'Rodada 2', 'grupos', 'B', '2026-06-21T19:00:00-03:00', 6, 7, 'BMO Field', 'Toronto', 'agendado'),
(1032, 'Rodada 2', 'grupos', 'B', '2026-06-21T22:00:00-03:00', 8, 5, 'Lincoln Financial Field', 'Filadélfia', 'agendado'),
(1033, 'Rodada 2', 'grupos', 'E', '2026-06-22T16:00:00-03:00', 18, 19, 'Rose Bowl', 'Los Angeles', 'agendado'),
(1034, 'Rodada 2', 'grupos', 'E', '2026-06-22T19:00:00-03:00', 20, 17, 'Lumen Field', 'Seattle', 'agendado'),
(1035, 'Rodada 2', 'grupos', 'F', '2026-06-22T22:00:00-03:00', 22, 23, 'Mercedes-Benz Stadium', 'Atlanta', 'agendado'),
(1036, 'Rodada 2', 'grupos', 'F', '2026-06-23T16:00:00-03:00', 24, 21, 'NRG Stadium', 'Houston', 'agendado'),
(1037, 'Rodada 2', 'grupos', 'G', '2026-06-23T19:00:00-03:00', 26, 27, 'MetLife Stadium', 'Nova York', 'agendado'),
(1038, 'Rodada 2', 'grupos', 'G', '2026-06-23T22:00:00-03:00', 28, 25, 'Hard Rock Stadium', 'Miami', 'agendado'),
(1039, 'Rodada 2', 'grupos', 'H', '2026-06-24T16:00:00-03:00', 30, 31, 'SoFi Stadium', 'Los Angeles', 'agendado'),
(1040, 'Rodada 2', 'grupos', 'H', '2026-06-24T19:00:00-03:00', 32, 29, 'AT&T Stadium', 'Dallas', 'agendado'),
(1041, 'Rodada 2', 'grupos', 'I', '2026-06-24T22:00:00-03:00', 34, 35, 'Lincoln Financial Field', 'Filadélfia', 'agendado'),
(1042, 'Rodada 2', 'grupos', 'I', '2026-06-25T16:00:00-03:00', 36, 33, 'BMO Field', 'Toronto', 'agendado'),
(1043, 'Rodada 2', 'grupos', 'J', '2026-06-25T19:00:00-03:00', 38, 39, 'Mercedes-Benz Stadium', 'Atlanta', 'agendado'),
(1044, 'Rodada 2', 'grupos', 'J', '2026-06-25T22:00:00-03:00', 40, 37, 'NRG Stadium', 'Houston', 'agendado'),
(1045, 'Rodada 2', 'grupos', 'K', '2026-06-26T16:00:00-03:00', 42, 43, 'Rose Bowl', 'Los Angeles', 'agendado'),
(1046, 'Rodada 2', 'grupos', 'K', '2026-06-26T19:00:00-03:00', 44, 41, 'Lumen Field', 'Seattle', 'agendado'),
(1047, 'Rodada 2', 'grupos', 'L', '2026-06-26T22:00:00-03:00', 46, 47, 'Estádio Azteca', 'Cidade do México', 'agendado'),
(1048, 'Rodada 2', 'grupos', 'L', '2026-06-27T16:00:00-03:00', 48, 45, 'Hard Rock Stadium', 'Miami', 'agendado'),

-- RODADA 3
(1049, 'Rodada 3', 'grupos', 'A', '2026-06-27T19:00:00-03:00', 1, 3, 'SoFi Stadium', 'Los Angeles', 'agendado'),
(1050, 'Rodada 3', 'grupos', 'A', '2026-06-27T19:00:00-03:00', 4, 2, 'Hard Rock Stadium', 'Miami', 'agendado'),
(1051, 'Rodada 3', 'grupos', 'B', '2026-06-27T22:00:00-03:00', 5, 7, 'BMO Field', 'Toronto', 'agendado'),
(1052, 'Rodada 3', 'grupos', 'B', '2026-06-27T22:00:00-03:00', 8, 6, 'Lincoln Financial Field', 'Filadélfia', 'agendado'),
(1053, 'Rodada 3', 'grupos', 'C', '2026-06-28T16:00:00-03:00', 10, 9, 'AT&T Stadium', 'Dallas', 'agendado'),
(1054, 'Rodada 3', 'grupos', 'C', '2026-06-28T16:00:00-03:00', 12, 11, 'MetLife Stadium', 'Nova York', 'agendado'),
(1055, 'Rodada 3', 'grupos', 'D', '2026-06-28T19:00:00-03:00', 14, 13, 'Estádio Azteca', 'Cidade do México', 'agendado'),
(1056, 'Rodada 3', 'grupos', 'D', '2026-06-28T19:00:00-03:00', 16, 15, 'NRG Stadium', 'Houston', 'agendado'),
(1057, 'Rodada 3', 'grupos', 'E', '2026-06-28T22:00:00-03:00', 17, 19, 'Rose Bowl', 'Los Angeles', 'agendado'),
(1058, 'Rodada 3', 'grupos', 'E', '2026-06-28T22:00:00-03:00', 20, 18, 'Lumen Field', 'Seattle', 'agendado'),
(1059, 'Rodada 3', 'grupos', 'F', '2026-06-29T16:00:00-03:00', 21, 23, 'Mercedes-Benz Stadium', 'Atlanta', 'agendado'),
(1060, 'Rodada 3', 'grupos', 'F', '2026-06-29T16:00:00-03:00', 24, 22, 'NRG Stadium', 'Houston', 'agendado'),
(1061, 'Rodada 3', 'grupos', 'G', '2026-06-29T19:00:00-03:00', 25, 27, 'MetLife Stadium', 'Nova York', 'agendado'),
(1062, 'Rodada 3', 'grupos', 'G', '2026-06-29T19:00:00-03:00', 28, 26, 'Hard Rock Stadium', 'Miami', 'agendado'),
(1063, 'Rodada 3', 'grupos', 'H', '2026-06-29T22:00:00-03:00', 29, 31, 'SoFi Stadium', 'Los Angeles', 'agendado'),
(1064, 'Rodada 3', 'grupos', 'H', '2026-06-29T22:00:00-03:00', 32, 30, 'AT&T Stadium', 'Dallas', 'agendado'),
(1065, 'Rodada 3', 'grupos', 'I', '2026-06-30T16:00:00-03:00', 33, 35, 'Lincoln Financial Field', 'Filadélfia', 'agendado'),
(1066, 'Rodada 3', 'grupos', 'I', '2026-06-30T16:00:00-03:00', 36, 34, 'BMO Field', 'Toronto', 'agendado'),
(1067, 'Rodada 3', 'grupos', 'J', '2026-06-30T19:00:00-03:00', 37, 39, 'Mercedes-Benz Stadium', 'Atlanta', 'agendado'),
(1068, 'Rodada 3', 'grupos', 'J', '2026-06-30T19:00:00-03:00', 40, 38, 'NRG Stadium', 'Houston', 'agendado'),
(1069, 'Rodada 3', 'grupos', 'K', '2026-06-30T22:00:00-03:00', 41, 43, 'Rose Bowl', 'Los Angeles', 'agendado'),
(1070, 'Rodada 3', 'grupos', 'K', '2026-06-30T22:00:00-03:00', 44, 42, 'Lumen Field', 'Seattle', 'agendado'),
(1071, 'Rodada 3', 'grupos', 'L', '2026-07-01T16:00:00-03:00', 45, 47, 'Estádio Azteca', 'Cidade do México', 'agendado'),
(1072, 'Rodada 3', 'grupos', 'L', '2026-07-01T16:00:00-03:00', 48, 46, 'Hard Rock Stadium', 'Miami', 'agendado')
ON CONFLICT (id) DO NOTHING;
