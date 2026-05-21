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

insert into public.usuarios_site (usuario, perfil, nome, salt, senha_hash)
values
  ('aminadabe.santos', 'admin', 'Aminadabe', 'jeovanissi:aminadabe.santos:v1', 'wByHZMyKhRRbO6fykZ7of8fuhWVbMfK8gH5O9E0I2K8='),
  ('patrick.prudente', 'admin', 'Patrick', 'jeovanissi:patrick.prudente:v1', '+OGjkF5MPoL/RqvdiaSH/JvAQky3FdvJbdqN+j9sfWc='),
  ('moises.souza', 'admin', 'Moises', 'jeovanissi:moises.souza:v1', '0v3fdJBFPh+JPF2VNyBAdlKNWB/1YtpnDHiWdQRt2pQ='),
  ('enzo.santos', 'membro', 'Enzo', 'jeovanissi:enzo.santos:v1', 'ZycztWtxvnZWGdpJPSL7zapaMXd2ZC/5fS5SH/lJkho='),
  ('alesio.ribeiro', 'membro', 'Alesio', 'jeovanissi:alesio.ribeiro:v1', '4Yd8xqQs24MDaW+kyRvqxwIDZJT80lniTcTKtIqVVEY='),
  ('douglas.batista', 'membro', 'Douglas', 'jeovanissi:douglas.batista:v1', 'Ap4TMCLQ0CaziEQFKTnhddpdJ2n491FyrxUzZ4Xsr8Y='),
  ('davi.ricardo', 'membro', 'Davi', 'jeovanissi:davi.ricardo:v1', 'cj2w/uAVusbYSfRlPKrz++nN/XyKIjH0jRYQh70g76c='),
  ('edilane.santos', 'membro', 'Edilane', 'jeovanissi:edilane.santos:v1', 'pfzpjhav8HmRUI6MiMeuiMC6NDxLhjNuLXYOpJViRfs='),
  ('joao.pinheiro', 'membro', 'Joao', 'jeovanissi:joao.pinheiro:v1', 'tDuFCQjCSuvY3z5vBXdI7FGT5KRfK1cyw7OjHaANGpI='),
  ('larrisa.brenda', 'membro', 'Larrisa', 'jeovanissi:larrisa.brenda:v1', 'Jl/VkFHQXgNhGmzhqQutwKHPB2rl7dWuEL9oiecVB6Y='),
  ('miguel.pinheiro', 'membro', 'Miguel', 'jeovanissi:miguel.pinheiro:v1', 'r6OVogJMWp4VN7gFMH28CmmohnrMu3eUlrInv/nTlTg='),
  ('nicole.cruz', 'membro', 'Nicole', 'jeovanissi:nicole.cruz:v1', 'ebtBvSQP1wcvAdOFuYMsr0agGAYm4hQI4CLW3gRz0JQ='),
  ('vanessa.rodrigues', 'membro', 'Vanessa', 'jeovanissi:vanessa.rodrigues:v1', 'LmWIaNXgB2mfDMWoK4GdhOdzn72+ZKrIUEnffmneXDQ='),
  ('vitoria.moreira', 'membro', 'Vitoria', 'jeovanissi:vitoria.moreira:v1', 'HVUo61q2saQ3XiB+gqHDjPH3uLoi8JDqKtj9sgThO7c='),
  ('wagao.barcelos', 'membro', 'Wagao', 'jeovanissi:wagao.barcelos:v1', 'L5ORwvS9gDF3lZYn1FrmdnlQe7TsQkZknNOdcHF20fU='),
  ('eliane.oliveira', 'membro', 'Eliane', 'jeovanissi:eliane.oliveira:v1', 'FjZb8K/Pz1zUj0ztSBq9sltjXafY3DUTjYV9Ca99FpI='),
  ('erika.goncalves', 'membro', 'Erika', 'jeovanissi:erika.goncalves:v1', 'JEXrysIQ4z181uPX7ElUCbRaBAoala//BgnpjIwYUy4=')
on conflict (usuario) do update
set perfil = excluded.perfil,
    nome = excluded.nome,
    salt = excluded.salt,
    senha_hash = excluded.senha_hash,
    ativo = true;
