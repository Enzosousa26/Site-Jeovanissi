insert into public.site_documents (chave, dados)
values
  (
    'membros',
    '[
      {"nome":"Aminadabe / Binho","cargo":"Lider Geral","categoria":"lider"},
      {"nome":"Patrick","cargo":"Lider Instrumental","categoria":"instrumental"},
      {"nome":"Moises","cargo":"Lider Vocal","categoria":"vocal"},
      {"nome":"Alesio","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Douglas","cargo":"Baterista / Baixista","categoria":"instrumental"},
      {"nome":"Edilane","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Enzo","cargo":"Baterista","categoria":"instrumental"},
      {"nome":"Joao","cargo":"Instrumental","categoria":"instrumental"},
      {"nome":"Larrisa","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Miguel","cargo":"Instrumental","categoria":"instrumental"},
      {"nome":"Nicole","cargo":"Vocalista / Midia","categoria":"vocal"},
      {"nome":"Vanessa","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Vitoria","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Wagao","cargo":"Baixista","categoria":"instrumental"},
      {"nome":"Eliane","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Erika","cargo":"Vocalista","categoria":"vocal"},
      {"nome":"Davi","cargo":"Vocalista","categoria":"vocal"}
    ]'::jsonb
  ),
  ('repertorio', '{}'::jsonb),
  ('escalas', '{}'::jsonb)
on conflict (chave) do nothing;

-- Usuarios e credenciais devem ser cadastrados fora do repositorio.
