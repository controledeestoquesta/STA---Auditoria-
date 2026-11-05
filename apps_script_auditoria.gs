/**
 * Auditoria STA – Santa Therezinha (versão 26)
 * Recebe os lançamentos do aplicativo e grava na planilha:
 *   - Auditoria_Ruas     (permissão aud_rua)
 *   - Auditoria_Retorno  (permissão aud_ret)
 *   - Auditoria_Cargas   (permissão aud_car)
 *   - Auditoria_Aero     (permissão aud_aer) – operadores de empilhadeira
 *   - aba de sobras de separação (rotina 8074, importada pelo ADM)
 * Login pela aba Permissionamento (Matrícula, Permissão, Observação, Senha, Status).
 * Quem tem a permissão aud_adm administra os acessos pelo aplicativo.
 * Fotos vão para a pasta "Fotos Auditoria de Ruas" no Google Drive.
 *
 * Implantar → Gerenciar implantações → lápis → Nova versão
 *   Executar como: Eu   |   Quem pode acessar: Qualquer pessoa
 */
const SHEET_ID = '1Srs2JdL1WEGsaa-SaLec2TaYQYX_eUmNsU2zE1M4CAA';
const PASTA_FOTOS = 'Fotos Auditoria de Ruas';
const ABA_PERMISSOES = 'Permissionamento';
const ABA_QUADRO = 'Quadro_Repositores';
const VALIDADE_LOGIN_DIAS = 180;

const ABAS = {
  ruas: {
    nome: 'Auditoria_Ruas', perm: 'aud_rua',
    colunas: ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Nome_Auditor', 'Produto', 'Descricao_Produto',
      'Endereco', 'Rua', 'Predio', 'Nivel', 'Apto', 'Erro_Produto', 'Endereco_Correto', 'Prox_Vencimento',
      'Data_Vencimento', 'Sem_Saldo', 'Avaria', 'Tipo_Avaria', 'Foto_Avaria', 'Qtd_Divergencia_Un',
      'Vl_Ult_Entrada', 'Valor_Divergencia', 'Observacao', 'Possui_NC', 'Matricula_Colaborador_NC',
      'Nome_Colaborador_NC', 'Funcao_Colaborador_NC', 'Status_NC', 'Responsavel_Tratativa',
      'Acao_Corretiva', 'Data_Resolucao', 'Ultima_Atualizacao', 'ID_Sessao', 'Links_Fotos', 'Recebido_Em'],
    texto: ['ID_Auditoria', 'Matricula_Auditor', 'Produto', 'Endereco', 'Endereco_Correto',
      'Matricula_Colaborador_NC', 'ID_Sessao', 'DataHora', 'Data_Vencimento', 'Ultima_Atualizacao']
  },
  retorno: {
    nome: 'Auditoria_Retorno', perm: 'aud_ret',
    colunas: ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Nome_Auditor', 'Produto', 'Descricao_Produto',
      'Rua', 'Prox_Vencimento', 'Data_Vencimento', 'Foto_Retorno', 'Foto_Etiqueta', 'Qtd_Etiqueta', 'Qtd_Fisico',
      'Observacao', 'Possui_NC', 'Matricula_Colaborador_NC', 'Nome_Colaborador_NC', 'Funcao_Colaborador_NC', 'Status_NC',
      'Responsavel_Tratativa', 'ID_Sessao', 'Links_Fotos', 'Recebido_Em',
      'Vl_Ult_Entrada', 'Valor_Total', 'Divergencia_Un', 'Valor_Divergencia', 'Numero_OS'],
    texto: ['ID_Auditoria', 'Matricula_Auditor', 'Produto', 'Matricula_Colaborador_NC', 'ID_Sessao',
      'DataHora', 'Data_Vencimento', 'Numero_OS']
  },
  cargas: {
    nome: 'Auditoria_Cargas', perm: 'aud_car',
    colunas: ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Nome_Auditor', 'Matricula_Conferente',
      'Nome_Conferente', 'Box', 'Numero_OS', 'Codigo_Produto', 'Descricao_Produto', 'Quantidade',
      'Motivo', 'Links_Fotos', 'ID_Sessao', 'Recebido_Em', 'Valor_Total', 'Causador', 'Matricula_Causador', 'Nome_Causador'],
    texto: ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Matricula_Conferente', 'Box', 'Numero_OS',
      'Codigo_Produto', 'ID_Sessao', 'Matricula_Causador']
  },
  aero: {
    nome: 'Auditoria_Aero', perm: 'aud_aer',
    colunas: ['Data', 'Operador', 'Código', 'Descrição', 'Rua', 'O.S', 'Tipo de O.S', 'Quantidade', 'Vlr. Total',
      'ID_Auditoria', 'DataHora', 'Matricula_Operador', 'Vl_Ult_Entrada', 'Observacao', 'Matricula_Auditor', 'Nome_Auditor', 'Status_NC', 'Recebido_Em', 'Links_Fotos'],
    texto: ['Data', 'Código', 'O.S', 'ID_Auditoria', 'DataHora', 'Matricula_Operador', 'Matricula_Auditor']
  },
  pp: {
    nome: 'Prevencao_Perdas', perm: 'aud_pp',
    colunas: ['Data', 'Matricula_Seguranca', 'Nome_Seguranca', 'Codigo_Produto', 'Descricao', 'Quantidade', 'Valor',
      'Rua', 'Predio', 'Nivel', 'Apartamento', 'Motivo', 'Matricula_Colaborador', 'Colaborador_Responsavel', 'Funcao_Colaborador',
      'Matricula_Encarregado', 'Encarregado_Setor', 'Assinatura_Encarregado', 'Status_Vale', 'Vale_Confirmado_Por', 'Vale_Confirmado_Em',
      'Observacao', 'Vl_Unitario', 'Links_Fotos', 'ID_Auditoria', 'DataHora', 'Recebido_Em'],
    texto: ['Data', 'DataHora', 'Matricula_Seguranca', 'Codigo_Produto', 'Rua', 'Predio', 'Nivel', 'Apartamento',
      'Matricula_Colaborador', 'Matricula_Encarregado', 'ID_Auditoria']
  }
};
ABAS.sac = {
  nome: 'SAC_Ocorrencias', perm: 'aud_sac',
  colunas: ['Data', 'Carregamento', 'NF', 'Codigo_Produto', 'Descricao', 'Quantidade', 'Vl_Unitario', 'Valor', 'Motivo',
    'Matricula_Conferente', 'Conferente', 'Funcao_Conferente', 'Observacao', 'Status_NC', 'Historico',
    'Matricula_Registrou', 'Nome_Registrou', 'Origem', 'Links_Fotos', 'ID_Auditoria', 'DataHora', 'Recebido_Em'],
  texto: ['Data', 'DataHora', 'Carregamento', 'NF', 'Codigo_Produto', 'Matricula_Conferente', 'Matricula_Registrou', 'ID_Auditoria']
};
const MOTIVOS_SAC = ['Falta', 'Sobra'];
const STATUS_SAC = ['Aberta', 'Em tratativa', 'Encerrada'];
const CAMPOS_SAC = ['ID_Auditoria', 'Data', 'DataHora', 'Carregamento', 'NF', 'Codigo_Produto', 'Descricao', 'Quantidade', 'Vl_Unitario', 'Valor', 'Motivo',
  'Matricula_Conferente', 'Conferente', 'Funcao_Conferente', 'Observacao', 'Status_NC', 'Historico', 'Matricula_Registrou', 'Nome_Registrou', 'Origem', 'Links_Fotos', 'Recebido_Em'];
const MOTIVOS_PP = ['Mercadoria avariada', 'Consumo indevido por colaborador'];
const STATUS_VALE = ['Pendente', 'Emitido', 'Não emitido'];
const CAMPOS_PP = ['ID_Auditoria', 'Data', 'DataHora', 'Matricula_Seguranca', 'Nome_Seguranca', 'Codigo_Produto', 'Descricao', 'Quantidade', 'Valor',
  'Rua', 'Predio', 'Nivel', 'Apartamento', 'Motivo', 'Matricula_Colaborador', 'Colaborador_Responsavel', 'Funcao_Colaborador',
  'Matricula_Encarregado', 'Encarregado_Setor', 'Assinatura_Encarregado', 'Status_Vale', 'Vale_Confirmado_Por', 'Vale_Confirmado_Em',
  'Observacao', 'Vl_Unitario', 'Links_Fotos', 'Recebido_Em'];
const MOTIVOS_CARGA = ['Falta', 'Avaria', 'Abastecimento', 'Sobras', 'Produto trocado', 'Produto próximo ao vencimento'];

/* ===================== Entradas ===================== */

function doPost(e) {
  if (!e || !e.postData) return resposta({ ok: false, erro: 'Chame pelo aplicativo. Para testar no editor, execute testeGravacao.' });
  let dados;
  try { dados = JSON.parse(e.postData.contents); } catch (err) { return resposta({ ok: false, erro: 'Dados inválidos.' }); }

  if (dados.acao === 'login') return resposta(login(dados.matricula, dados.senha));

  const sessao = validarToken(dados.token);
  if (!sessao.ok) return resposta({ ok: false, erro: sessao.erro, login: true });

  if (dados.acao === 'fotos') return resposta(lerFotos(dados.ids));
  if (['com_ler', 'com_salvar', 'cha_ler', 'cha_salvar', 'cl_ler', 'cl_salvar', 'cl_excluir'].indexOf(dados.acao) >= 0) {
    const pode = function (x) { return sessao.permissoes.indexOf('aud_adm') >= 0 || sessao.permissoes.indexOf(x) >= 0; };
    const ehCom = dados.acao.indexOf('com_') === 0 || dados.acao.indexOf('cl_') === 0;
    if (ehCom ? !pode('aud_com') : !(pode('aud_cha') || pode('aud_com'))) return resposta({ ok: false, erro: ehCom ? 'Sem permissão de comissão (aud_com).' : 'Sem permissão de chamada (aud_cha).' });
    const lkc = LockService.getScriptLock(); lkc.waitLock(30000);
    try {
      if (dados.acao === 'com_ler') return resposta(comLer(dados.chaves || []));
      if (dados.acao === 'com_salvar') return resposta(comSalvar(dados.chave, dados.valor, sessao));
      if (dados.acao === 'cl_ler') return resposta(Object.assign({ ok: true }, lerAba(abrirPlanilha(), ABA_LANC, CAMPOS_LANC)));
      if (dados.acao === 'cl_salvar') return resposta(lancSalvar(dados.registros || [], sessao));
      if (dados.acao === 'cl_excluir') return resposta(lancExcluir(dados.ids || []));
      if (dados.acao === 'cha_ler') return resposta(Object.assign({ ok: true, config: comLer(['config']).valores.config || null }, lerAba(abrirPlanilha(), ABA_CHAMADA, CAMPOS_CHAMADA)));
      return resposta(chaSalvar(dados.data, dados.registros || [], sessao));
    } catch (err) { return resposta({ ok: false, erro: String(err.message || err) }); }
    finally { lkc.releaseLock(); }
  }
  if (dados.acao === 'sac_listar' || dados.acao === 'sac_status') {
    if (sessao.permissoes.indexOf('aud_adm') < 0 && sessao.permissoes.indexOf('aud_sac') < 0) return resposta({ ok: false, erro: 'Sem permissão do SAC (aud_sac).' });
    if (dados.acao === 'sac_listar') return resposta(Object.assign({ ok: true }, lerAba(abrirPlanilha(), ABAS.sac.nome, CAMPOS_SAC)));
    const lks = LockService.getScriptLock(); lks.waitLock(30000);
    try { return resposta(statusSac(dados.id, dados.status, dados.nota, sessao)); }
    catch (err) { return resposta({ ok: false, erro: String(err.message || err) }); }
    finally { lks.releaseLock(); }
  }
  if (dados.acao === 'pp_listar' || dados.acao === 'pp_vale') {
    const pode = function (x) { return sessao.permissoes.indexOf('aud_adm') >= 0 || sessao.permissoes.indexOf(x) >= 0; };
    if (dados.acao === 'pp_listar') {
      if (!pode('aud_pp') && !pode('aud_vale')) return resposta({ ok: false, erro: 'Sem permissão de Prevenção de Perdas.' });
      return resposta(Object.assign({ ok: true }, lerAba(abrirPlanilha(), ABAS.pp.nome, CAMPOS_PP)));
    }
    if (!pode('aud_vale')) return resposta({ ok: false, erro: 'Confirmar vale exige a permissão aud_vale.' });
    const lkv = LockService.getScriptLock(); lkv.waitLock(30000);
    try { return resposta(confirmarVale(dados.id, dados.status, sessao)); }
    catch (err) { return resposta({ ok: false, erro: String(err.message || err) }); }
    finally { lkv.releaseLock(); }
  }
  if (dados.acao === 'colab_salvar') return resposta(salvarColaboradores(dados.lista, sessao));
  if (dados.acao === 'sobras_salvar') {
    if (sessao.permissoes.indexOf('aud_adm') < 0) return resposta({ ok: false, erro: 'Importar a rotina 8074 é só para ADM.' });
    return resposta(salvarSobras(dados.linhas, sessao));
  }
  if (dados.acao === 'rotina_salvar') {
    if (sessao.permissoes.indexOf('aud_ret') < 0 && sessao.permissoes.indexOf('aud_adm') < 0) return resposta({ ok: false, erro: 'Importar a rotina exige aud_ret ou aud_adm.' });
    return resposta(salvarRotina(dados.linhas, sessao));
  }

  if (String(dados.acao || '').indexOf('admin_') === 0) {
    if (sessao.permissoes.indexOf('aud_adm') < 0) return resposta({ ok: false, erro: 'Sem permissão de administração (aud_adm).' });
    const lk = LockService.getScriptLock(); lk.waitLock(30000);
    try {
      if (dados.acao === 'admin_listar') return resposta(adminListar());
      if (dados.acao === 'admin_salvar') return resposta(adminSalvar(dados, sessao));
      if (dados.acao === 'admin_excluir') return resposta(adminExcluir(dados.aba, dados.id));
      return resposta({ ok: false, erro: 'Ação desconhecida.' });
    } catch (err) { return resposta({ ok: false, erro: String(err.message || err) }); }
    finally { lk.releaseLock(); }
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = abrirPlanilha();
    const grupos = {};
    (Array.isArray(dados.records) ? dados.records : []).forEach(function (r) {
      const aba = (r && r._aba) || 'ruas';
      (grupos[aba] = grupos[aba] || []).push(r);
    });
    let adicionados = 0;
    for (const aba in grupos) {
      const cfg = ABAS[aba];
      if (!cfg) return resposta({ ok: false, erro: 'Tipo de auditoria desconhecido: ' + aba });
      if (sessao.permissoes.indexOf(cfg.perm) < 0) {
        return resposta({ ok: false, erro: 'A matrícula ' + sessao.matricula + ' não tem a permissão ' + cfg.perm + ' na aba Permissionamento.' });
      }
      adicionados += gravar(ss, cfg, grupos[aba]);
    }
    return resposta({ ok: true, adicionados: adicionados });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const ss = abrirPlanilha();
    if (p.acao === 'sessao') return resposta(validarToken(p.token));
    if (p.acao === 'apoio') {
      const s = validarToken(p.token);
      if (!s.ok) return resposta({ ok: false, erro: s.erro, login: true });
      return resposta({ ok: true, colaboradores: lerTabelaSimples(ss, ABA_COLAB, 3), rotina: lerRotina(ss, 60) });
    }
    if (p.acao === 'fechamento') {
      const s = validarToken(p.token);
      if (!s.ok) return resposta({ ok: false, erro: s.erro, login: true });
      const tem = function (x) { return s.permissoes.indexOf('aud_adm') >= 0 || s.permissoes.indexOf('aud_com') >= 0 || s.permissoes.indexOf(x) >= 0; };
      if (!tem('aud_rua') && !tem('aud_ret') && !tem('aud_car') && !tem('aud_aer') && !tem('aud_pp') && !tem('aud_vale') && !tem('aud_sac')) return resposta({ ok: false, erro: 'Sem permissão para o fechamento.' });
      const vazio = { colunas: ['ID_Auditoria'], registros: [] };
      const out = {
        ok: true,
        ruas: !tem('aud_rua') ? vazio : lerAba(ss, ABAS.ruas.nome, ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Nome_Auditor', 'Endereco', 'Rua', 'Erro_Produto', 'Prox_Vencimento',
          'Sem_Saldo', 'Avaria', 'Possui_NC', 'Qtd_Divergencia_Un', 'Valor_Divergencia', 'Matricula_Colaborador_NC', 'Nome_Colaborador_NC', 'Status_NC', 'ID_Sessao', 'Recebido_Em',
          'Produto', 'Descricao_Produto', 'Endereco_Correto', 'Data_Vencimento', 'Tipo_Avaria', 'Vl_Ult_Entrada', 'Observacao', 'Predio', 'Nivel', 'Apto', 'Funcao_Colaborador_NC', 'Links_Fotos']),
        retorno: !tem('aud_ret') ? vazio : lerAba(ss, ABAS.retorno.nome, ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Nome_Auditor', 'Produto', 'Descricao_Produto', 'Rua', 'Prox_Vencimento',
          'Possui_NC', 'Qtd_Etiqueta', 'Qtd_Fisico', 'Valor_Total', 'Divergencia_Un', 'Valor_Divergencia', 'Matricula_Colaborador_NC', 'Nome_Colaborador_NC', 'Status_NC', 'ID_Sessao', 'Recebido_Em', 'Numero_OS', 'Data_Vencimento', 'Observacao', 'Vl_Ult_Entrada', 'Funcao_Colaborador_NC', 'Foto_Retorno', 'Foto_Etiqueta', 'Links_Fotos']),
        rotina: !tem('aud_ret') ? [] : lerRotina(ss, 400),
        cargas: !tem('aud_car') ? vazio : lerAba(ss, ABAS.cargas.nome, ['ID_Auditoria', 'DataHora', 'Matricula_Auditor', 'Nome_Auditor', 'Matricula_Conferente', 'Nome_Conferente', 'Box', 'Numero_OS',
          'Codigo_Produto', 'Descricao_Produto', 'Quantidade', 'Motivo', 'Valor_Total', 'Causador', 'Matricula_Causador', 'Nome_Causador', 'ID_Sessao', 'Recebido_Em', 'Links_Fotos']),
        aero: !tem('aud_aer') ? vazio : lerAba(ss, ABAS.aero.nome, ['ID_Auditoria', 'Data', 'DataHora', 'Matricula_Operador', 'Operador', 'Código', 'Descrição', 'Rua', 'O.S',
          'Tipo de O.S', 'Quantidade', 'Vl_Ult_Entrada', 'Vlr. Total', 'Observacao', 'Matricula_Auditor', 'Nome_Auditor', 'Status_NC', 'Recebido_Em', 'Links_Fotos']),
        pp: !(tem('aud_pp') || tem('aud_vale')) ? vazio : lerAba(ss, ABAS.pp.nome, CAMPOS_PP),
        sac: !tem('aud_sac') ? vazio : lerAba(ss, ABAS.sac.nome, CAMPOS_SAC),
        sobras: s.permissoes.indexOf('aud_adm') < 0 ? [] : lerSobras(ss),
        quadro: lerQuadro(ss)
      };
      return resposta(out);
    }
    if (p.acao === 'registros') {
      const s = validarToken(p.token);
      if (!s.ok) return resposta({ ok: false, erro: s.erro, login: true });
      return listarRegistros(ss);
    }
    return resposta({ ok: true, servico: 'Auditoria STA', versao: 26, planilha: ss.getName() });
  } catch (err) {
    return resposta({ ok: false, erro: 'Sem acesso à planilha: ' + err });
  }
}

/* ===================== Login e permissões ===================== */

function normalizar(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const PERMISSOES_CONHECIDAS = {
  aud_rua: 'Acesso a aba de auditoria_ruas',
  aud_ret: 'Acesso a aba de auditoria_retorno',
  aud_car: 'Acesso a aba de auditoria_cargas',
  aud_aer: 'Acesso a aba de auditoria_aero',
  aud_pp: 'Acesso a aba de prevencao de perdas (segurancas)',
  aud_vale: 'Acesso a aba de emissao de vales (prevencao de perdas)',
  aud_sac: 'Acesso a aba do SAC (ocorrencias de falta e sobra)',
  aud_com: 'Acesso a comissao do controle de estoque (equipes, metas, valores)',
  aud_cha: 'Acesso a chamada (presenca) do controle de estoque',
  aud_adm: 'Acesso a tela de administracao'
};

/** Lê a aba Permissionamento (cria a coluna Status se não existir). */
function tabelaPermissoes() {
  const sh = abrirPlanilha().getSheetByName(ABA_PERMISSOES);
  if (!sh) throw new Error('Aba Permissionamento não encontrada.');
  let ultCol = Math.max(sh.getLastColumn(), 1);
  const cab = sh.getRange(1, 1, 1, ultCol).getDisplayValues()[0].map(normalizar);
  const achar = function (p) { return cab.findIndex(function (h) { return h.indexOf(p) === 0; }); };
  const T = { sh: sh, iMat: achar('MATRIC'), iPer: achar('PERMISS'), iObs: achar('OBSERV'), iSen: achar('SENHA'), iSta: achar('STATUS') };
  if (T.iMat < 0 || T.iPer < 0 || T.iSen < 0) throw new Error('A aba Permissionamento precisa das colunas Matrícula, Permissão e Senha.');
  if (T.iSta < 0) {
    T.iSta = ultCol; sh.getRange(1, ultCol + 1).setValue('Status').setFontWeight('bold'); ultCol++;
    if (sh.getLastRow() > 1) sh.getRange(2, ultCol, sh.getLastRow() - 1, 1).setValue('Ativo');
  }
  T.ultCol = ultCol;
  T.linhas = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, ultCol).getDisplayValues() : [];
  return T;
}

const bloqueado = function (s) { return normalizar(s) === 'BLOQUEADO'; };

/** { matricula: { senhas[], permissoes[] } } só com linhas ativas. */
function lerPermissoes() {
  const T = tabelaPermissoes(), mapa = {};
  T.linhas.forEach(function (l) {
    const mat = String(l[T.iMat]).trim(), per = String(l[T.iPer]).trim().toLowerCase(), sen = String(l[T.iSen]).trim();
    if (!mat || !per || bloqueado(l[T.iSta])) return;
    const m = mapa[mat] = mapa[mat] || { senhas: [], permissoes: [] };
    if (sen && m.senhas.indexOf(sen) < 0) m.senhas.push(sen);
    if (m.permissoes.indexOf(per) < 0) m.permissoes.push(per);
  });
  return mapa;
}

function login(matricula, senha) {
  const mat = String(matricula || '').trim(), sen = String(senha || '').trim();
  if (!mat || !sen) return { ok: false, erro: 'Informe matrícula e senha.' };
  const u = lerPermissoes()[mat];
  if (!u) {
    const T = tabelaPermissoes();
    const existe = T.linhas.some(function (l) { return String(l[T.iMat]).trim() === mat; });
    return { ok: false, erro: existe ? 'Acesso bloqueado. Fale com o administrador.' : 'Matrícula ou senha inválidas.' };
  }
  if (u.senhas.indexOf(sen) < 0) return { ok: false, erro: 'Matrícula ou senha inválidas.' };
  return { ok: true, matricula: mat, nome: nomeDaMatricula(mat), permissoes: u.permissoes, token: gerarToken(mat) };
}

function segredo() {
  const pr = PropertiesService.getScriptProperties();
  let s = pr.getProperty('SEGREDO');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); pr.setProperty('SEGREDO', s); }
  return s;
}

function assinar(texto) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(texto, segredo())).replace(/=+$/, '');
}

function gerarToken(mat) {
  const base = mat + '.' + Date.now();
  return base + '.' + assinar(base);
}

/** Confere o token e devolve as permissões ATUAIS (tirar a matrícula da aba = perde o acesso). */
function validarToken(token) {
  const t = String(token || '').split('.');
  if (t.length !== 3) return { ok: false, erro: 'Faça login no aplicativo.' };
  const base = t[0] + '.' + t[1];
  if (assinar(base) !== t[2]) return { ok: false, erro: 'Login inválido. Entre novamente.' };
  if (Date.now() - Number(t[1]) > VALIDADE_LOGIN_DIAS * 864e5) return { ok: false, erro: 'Login expirado. Entre novamente.' };
  const u = lerPermissoes()[t[0]];
  if (!u || !u.permissoes.length) return { ok: false, erro: 'Matrícula sem permissão na aba Permissionamento.' };
  return { ok: true, matricula: t[0], nome: nomeDaMatricula(t[0]), permissoes: u.permissoes };
}

function nomeDaMatricula(mat) {
  try {
    const sh = abrirPlanilha().getSheetByName(ABA_QUADRO);
    if (!sh || sh.getLastRow() < 2) return '';
    const v = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues();
    for (let i = 0; i < v.length; i++) if (String(v[i][0]).trim() === mat) return String(v[i][1]).trim();
  } catch (e) {}
  return '';
}

/* ===================== Administração (aud_adm) ===================== */

function adminListar() {
  const T = tabelaPermissoes(), us = {};
  T.linhas.forEach(function (l) {
    const mat = String(l[T.iMat]).trim(), per = String(l[T.iPer]).trim().toLowerCase();
    if (!mat || !per) return;
    const u = us[mat] = us[mat] || { matricula: mat, senha: '', nome: '', perms: {} };
    if (!u.senha) u.senha = String(l[T.iSen]).trim();
    u.perms[per] = bloqueado(l[T.iSta]) ? 'Bloqueado' : 'Ativo';
  });
  const lista = Object.keys(us).map(function (m) { us[m].nome = nomeDaMatricula(m); return us[m]; })
    .sort(function (a, b) { return (a.nome || a.matricula).localeCompare(b.nome || b.matricula); });
  return { ok: true, usuarios: lista, permissoes: Object.keys(PERMISSOES_CONHECIDAS) };
}

/** Exclui um lançamento (linha) pelo ID_Auditoria. */
function adminExcluir(aba, id) {
  const cfg = ABAS[aba || 'ruas'];
  if (!cfg) throw new Error('Tipo de auditoria desconhecido.');
  const sh = abrirPlanilha().getSheetByName(cfg.nome);
  if (!sh || sh.getLastRow() < 2) return { ok: true, excluidos: 0 };
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), col = cab.indexOf('ID_Auditoria') + 1;
  const ids = sh.getRange(2, col, sh.getLastRow() - 1, 1).getDisplayValues();
  let n = 0;
  for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]).trim() === String(id)) { sh.deleteRow(i + 2); n++; }
  return { ok: true, excluidos: n };
}

function adminSalvar(d, sessao) {
  const orig = String(d.original || '').trim(), mat = String(d.matricula || '').replace(/\D/g, ''), sen = String(d.senha || '').trim();
  const perms = d.perms || {};
  if (!mat) throw new Error('Informe a matrícula.');
  if (sen.length < 4) throw new Error('A senha precisa ter ao menos 4 caracteres.');
  if (orig === sessao.matricula && perms.aud_adm !== true) throw new Error('Você não pode tirar o seu próprio acesso de administração.');
  const T = tabelaPermissoes(), sh = T.sh;
  if (mat !== orig && T.linhas.some(function (l) { return String(l[T.iMat]).trim() === mat; })) throw new Error('Já existe um acesso com a matrícula ' + mat + '.');
  const existentes = {};
  if (orig) T.linhas.forEach(function (l, i) { if (String(l[T.iMat]).trim() === orig) existentes[String(l[T.iPer]).trim().toLowerCase()] = i + 2; });
  if (orig && !Object.keys(existentes).length) throw new Error('Matrícula ' + orig + ' não encontrada na planilha.');
  if (!orig && !Object.keys(perms).some(function (p) { return perms[p] === true; })) throw new Error('Libere ao menos um acesso.');

  Object.keys(existentes).forEach(function (per) {
    const lin = existentes[per];
    sh.getRange(lin, T.iMat + 1).setNumberFormat('@').setValue(mat);
    sh.getRange(lin, T.iSen + 1).setNumberFormat('@').setValue(sen);
    if (per in perms) sh.getRange(lin, T.iSta + 1).setValue(perms[per] === true ? 'Ativo' : 'Bloqueado');
  });
  Object.keys(perms).forEach(function (per) {
    if (perms[per] !== true || existentes[per]) return;
    const linha = new Array(T.ultCol).fill('');
    linha[T.iMat] = mat; linha[T.iPer] = per; linha[T.iSen] = sen; linha[T.iSta] = 'Ativo';
    if (T.iObs >= 0) linha[T.iObs] = PERMISSOES_CONHECIDAS[per] || '';
    const n = sh.getLastRow() + 1;
    sh.getRange(n, 1, 1, T.ultCol).setNumberFormat('@').setValues([linha]);
  });
  return { ok: true };
}

/** Rode se precisar derrubar todos os logins (todos terão de entrar de novo). */
function revogarTodosOsLogins() {
  PropertiesService.getScriptProperties().deleteProperty('SEGREDO');
}

/* ===================== Gravação ===================== */

function abrirPlanilha() {
  try { const a = SpreadsheetApp.getActiveSpreadsheet(); if (a) return a; } catch (err) {}
  return SpreadsheetApp.openById(SHEET_ID);
}

function gravar(ss, cfg, registros) {
  const sh = ss.getSheetByName(cfg.nome) || ss.insertSheet(cfg.nome);
  if (sh.getLastRow() === 0) sh.appendRow(cfg.colunas);
  const cab = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  cfg.colunas.forEach(function (c) {
    if (cab.indexOf(c) < 0) { sh.getRange(1, cab.length + 1).setValue(c); cab.push(c); }
  });
  if (cfg === ABAS.cargas) validarMotivosCarga(sh);
  if (cfg === ABAS.pp) validarListasPP(sh, cab);
  if (cfg === ABAS.sac) validarListas(sh, cab, [['Motivo', MOTIVOS_SAC], ['Status_NC', STATUS_SAC]]);
  const colId = cab.indexOf('ID_Auditoria');
  const existentes = new Set(sh.getLastRow() > 1
    ? sh.getRange(2, colId + 1, sh.getLastRow() - 1, 1).getValues().map(function (l) { return String(l[0]); })
    : []);

  const linhas = [];
  registros.forEach(function (r) {
    if (!r || !r.ID_Auditoria || existentes.has(String(r.ID_Auditoria))) return;
    try {
      if (cfg === ABAS.retorno) {
        const fr = salvarFoto(r.foto_retorno, r.ID_Auditoria + '_retorno');
        const fe = salvarFoto(r.foto_etiqueta, r.ID_Auditoria + '_etiqueta');
        r.Foto_Retorno = fr; r.Foto_Etiqueta = fe;
        r.Links_Fotos = [fr, fe].filter(String).join(' ');
      } else if (cfg === ABAS.cargas) {
        r.Links_Fotos = true
          ? (r.fotos || []).map(function (d, i) { return salvarFoto(d, r.ID_Auditoria + '_' + (i + 1)); }).filter(String).join(' ')
          : '';
      } else {
        r.Links_Fotos = (r.fotos || []).map(function (d, i) { return salvarFoto(d, r.ID_Auditoria + '_' + (i + 1)); }).filter(String).join(' ');
      }
    } catch (err) { r.Links_Fotos = 'Fotos não salvas: ' + err; }
    r.Recebido_Em = new Date();
    linhas.push(cab.map(function (h) { const v = r[h]; return v === undefined || v === null ? '' : v; }));
    existentes.add(String(r.ID_Auditoria));
  });

  if (linhas.length) {
    const ini = sh.getLastRow() + 1;
    cfg.texto.forEach(function (c) {
      const i = cab.indexOf(c);
      if (i >= 0) sh.getRange(ini, i + 1, linhas.length, 1).setNumberFormat('@');
    });
    sh.getRange(ini, 1, linhas.length, cab.length).setValues(linhas);
  }
  return linhas.length;
}

function salvarFoto(dataUrl, nome) {
  const m = String(dataUrl || '').match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!m) return '';
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], nome + '.jpg');
  return obterPasta().createFile(blob).getUrl();
}

/** Devolve as fotos do Drive como data URL (para imprimir as NCs com foto). */
function lerFotos(ids) {
  const out = {};
  (ids || []).slice(0, 20).forEach(function (id) {
    try {
      const b = DriveApp.getFileById(String(id)).getBlob();
      out[id] = 'data:' + (b.getContentType() || 'image/jpeg') + ';base64,' + Utilities.base64Encode(b.getBytes());
    } catch (e) { }
  });
  return { ok: true, fotos: out };
}

/** Mantém a lista de motivos da aba de cargas atualizada. */
function validarMotivosCarga(sh) {
  try {
    const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String), iMot = cab.indexOf('Motivo');
    if (iMot < 0) return;
    const r = sh.getRange(2, iMot + 1, sh.getMaxRows() - 1, 1), atual = r.getDataValidation();
    const lista = atual && atual.getCriteriaValues && atual.getCriteriaValues()[0];
    if (lista && Array.isArray(lista) && lista.indexOf('Produto próximo ao vencimento') >= 0) return;
    r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(MOTIVOS_CARGA, true).setAllowInvalid(false)
      .setHelpText('Escolha: Falta, Avaria, Abastecimento, Sobras, Produto trocado ou Produto próximo ao vencimento').build());
  } catch (e) { }
}

/** Prevenção de perdas: listas suspensas de Motivo e Status_Vale. */
function validarListasPP(sh, cab) {
  try {
    [['Motivo', MOTIVOS_PP], ['Status_Vale', STATUS_VALE]].forEach(function (x) {
      const i = cab.indexOf(x[0]); if (i < 0) return;
      const r = sh.getRange(2, i + 1, Math.max(sh.getMaxRows() - 1, 1), 1);
      if (r.getDataValidation()) return;
      r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(x[1], true).setAllowInvalid(false).build());
    });
  } catch (e) { }
}

/* ===================== Comissão e chamada ===================== */
const ABA_COMISSAO = 'Comissao_Config';
const ABA_CHAMADA = 'Chamada';
const CAMPOS_CHAMADA = ['Chave', 'Data', 'Matricula', 'Nome', 'Equipe', 'Turno', 'Status', 'Observacao', 'Registrado_Por', 'Registrado_Em'];
const ABA_LANC = 'Comissao_Lancamentos';
const CAMPOS_LANC = ['ID', 'Data', 'Matricula', 'Nome', 'Subsetor', 'Atividade_Id', 'Atividade', 'Quantidade', 'Valor_Unitario', 'Total', 'Observacao', 'Registrado_Por', 'Registrado_Em'];
const STATUS_CHAMADA = ['Presente', 'Falta', 'Falta justificada', 'Atestado', 'Folga', 'Férias', 'Atraso'];

function abaComissao() {
  const ss = abrirPlanilha();
  let sh = ss.getSheetByName(ABA_COMISSAO);
  if (!sh) { sh = ss.insertSheet(ABA_COMISSAO); sh.appendRow(['Chave', 'Valor', 'Atualizado_Em', 'Atualizado_Por']); sh.setFrozenRows(1); }
  return sh;
}
/** Lê chaves da configuração (JSON). Sem chaves: devolve todas. */
function comLer(chaves) {
  const sh = abaComissao(), out = {};
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (l) {
    const k = String(l[0]); if (!k || (chaves.length && chaves.indexOf(k) < 0)) return;
    try { out[k] = JSON.parse(String(l[1] || 'null')); } catch (e) { out[k] = null; }
  });
  return { ok: true, valores: out };
}
function comSalvar(chave, valor, sessao) {
  if (!chave || !/^[\w\-]{1,60}$/.test(String(chave))) throw new Error('Chave inválida.');
  const sh = abaComissao(), json = JSON.stringify(valor == null ? null : valor);
  if (json.length > 45000) throw new Error('Configuração grande demais para uma célula.');
  const quando = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'), por = (sessao.nome || '') + ' (' + sessao.matricula + ')';
  const n = sh.getLastRow(), ks = n >= 2 ? sh.getRange(2, 1, n - 1, 1).getValues().map(function (l) { return String(l[0]); }) : [];
  const i = ks.indexOf(String(chave));
  const linha = [[String(chave), json, quando, por]];
  if (i >= 0) sh.getRange(i + 2, 1, 1, 4).setValues(linha); else sh.getRange(n + 1, 1, 1, 4).setValues(linha);
  return { ok: true, chave: chave, em: quando };
}
function abaLanc() {
  const ss = abrirPlanilha();
  let sh = ss.getSheetByName(ABA_LANC);
  if (!sh) { sh = ss.insertSheet(ABA_LANC); sh.appendRow(CAMPOS_LANC); sh.setFrozenRows(1); sh.getRange('A:C').setNumberFormat('@'); }
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  CAMPOS_LANC.forEach(function (c) { if (cab.indexOf(c) < 0) { sh.getRange(1, cab.length + 1).setValue(c); cab.push(c); } });
  return { sh: sh, cab: cab };
}
/** Lançamentos de comissão: grava (ou regrava pelo ID). */
function lancSalvar(registros, sessao) {
  const A = abaLanc(), sh = A.sh, cab = A.cab, iId = cab.indexOf('ID'), n = sh.getLastRow();
  const ids = n >= 2 ? sh.getRange(2, iId + 1, n - 1, 1).getValues().map(function (l) { return String(l[0]); }) : [];
  const quando = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'), por = (sessao.nome || '') + ' (' + sessao.matricula + ')';
  let novos = 0, atual = 0, prox = n + 1;
  registros.forEach(function (r) {
    if (!r.ID || !r.Matricula) return;
    const obj = Object.assign({}, r, { Registrado_Por: por, Registrado_Em: quando });
    const linha = [cab.map(function (c) { return obj[c] == null ? '' : obj[c]; })];
    const i = ids.indexOf(String(r.ID));
    if (i >= 0) { sh.getRange(i + 2, 1, 1, cab.length).setValues(linha); atual++; }
    else { sh.getRange(prox, 1, 1, cab.length).setValues(linha); ids.push(String(r.ID)); prox++; novos++; }
  });
  return { ok: true, novos: novos, atualizados: atual, por: por, em: quando };
}
function lancExcluir(lista) {
  const A = abaLanc(), sh = A.sh, iId = A.cab.indexOf('ID'), n = sh.getLastRow();
  if (n < 2) return { ok: true, excluidos: 0 };
  const alvo = lista.map(String), ids = sh.getRange(2, iId + 1, n - 1, 1).getValues().map(function (l) { return String(l[0]); });
  let k = 0;
  for (let i = ids.length - 1; i >= 0; i--) if (alvo.indexOf(ids[i]) >= 0) { sh.deleteRow(i + 2); k++; }
  return { ok: true, excluidos: k };
}

/** Grava a chamada de um dia (uma linha por colaborador; regrava se já existir). */
function chaSalvar(data, registros, sessao) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(String(data))) throw new Error('Data inválida.');
  const ss = abrirPlanilha();
  let sh = ss.getSheetByName(ABA_CHAMADA);
  if (!sh) { sh = ss.insertSheet(ABA_CHAMADA); sh.appendRow(CAMPOS_CHAMADA); sh.setFrozenRows(1); sh.getRange('A:C').setNumberFormat('@');
    try { sh.getRange(2, CAMPOS_CHAMADA.indexOf('Status') + 1, sh.getMaxRows() - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS_CHAMADA, true).setAllowInvalid(false).build()); } catch (e) { } }
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  CAMPOS_CHAMADA.forEach(function (c) { if (cab.indexOf(c) < 0) { sh.getRange(1, cab.length + 1).setValue(c); cab.push(c); } });
  const n = sh.getLastRow(), iK = cab.indexOf('Chave');
  const ks = n >= 2 ? sh.getRange(2, iK + 1, n - 1, 1).getValues().map(function (l) { return String(l[0]); }) : [];
  const quando = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'), por = (sessao.nome || '') + ' (' + sessao.matricula + ')';
  let novos = 0, atual = 0, prox = n + 1;
  registros.forEach(function (r) {
    if (STATUS_CHAMADA.indexOf(r.Status) < 0 || !r.Matricula) return;
    const k = data + '|' + r.Matricula;
    const obj = { Chave: k, Data: data, Matricula: String(r.Matricula), Nome: r.Nome || '', Equipe: r.Equipe || '', Turno: r.Turno || '', Status: r.Status, Observacao: r.Observacao || '', Registrado_Por: por, Registrado_Em: quando };
    const linha = [cab.map(function (c) { return obj[c] == null ? '' : obj[c]; })];
    const i = ks.indexOf(k);
    if (i >= 0) { sh.getRange(i + 2, 1, 1, cab.length).setValues(linha); atual++; }
    else { sh.getRange(prox, 1, 1, cab.length).setValues(linha); ks.push(k); prox++; novos++; }
  });
  return { ok: true, novos: novos, atualizados: atual };
}

/** Listas suspensas genéricas (coluna, opções). */
function validarListas(sh, cab, listas) {
  try {
    listas.forEach(function (x) {
      const i = cab.indexOf(x[0]); if (i < 0) return;
      const r = sh.getRange(2, i + 1, Math.max(sh.getMaxRows() - 1, 1), 1);
      if (r.getDataValidation()) return;
      r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(x[1], true).setAllowInvalid(false).build());
    });
  } catch (e) { }
}

/** SAC: muda a situação da ocorrência e acrescenta uma linha no Histórico. */
function statusSac(id, status, nota, sessao) {
  if (STATUS_SAC.indexOf(status) < 0) throw new Error('Situação inválida.');
  const sh = abrirPlanilha().getSheetByName(ABAS.sac.nome);
  if (!sh || sh.getLastRow() < 2) throw new Error('Aba ' + ABAS.sac.nome + ' sem registros.');
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  ['Status_NC', 'Historico'].forEach(function (c) { if (cab.indexOf(c) < 0) { sh.getRange(1, cab.length + 1).setValue(c); cab.push(c); } });
  const iId = cab.indexOf('ID_Auditoria');
  const ids = sh.getRange(2, iId + 1, sh.getLastRow() - 1, 1).getValues().map(function (l) { return String(l[0]); });
  const k = ids.indexOf(String(id));
  if (k < 0) throw new Error('Ocorrência não encontrada: ' + id);
  const lin = k + 2, quando = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  const cH = sh.getRange(lin, cab.indexOf('Historico') + 1), ant = String(cH.getValue() || '');
  const linha = quando + ' – ' + status + ' por ' + (sessao.nome || '') + ' (' + sessao.matricula + ')' + (nota ? ': ' + String(nota).slice(0, 300) : '');
  const hist = ant ? ant + '\n' + linha : linha;
  sh.getRange(lin, cab.indexOf('Status_NC') + 1).setValue(status);
  cH.setValue(hist);
  return { ok: true, id: String(id), status: status, historico: hist };
}

/** Confirma (ou não) a emissão do vale de uma ocorrência de Prevenção de Perdas. */
function confirmarVale(id, status, sessao) {
  if (STATUS_VALE.indexOf(status) < 0) throw new Error('Situação do vale inválida.');
  const sh = abrirPlanilha().getSheetByName(ABAS.pp.nome);
  if (!sh || sh.getLastRow() < 2) throw new Error('Aba ' + ABAS.pp.nome + ' sem registros.');
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  ['Status_Vale', 'Vale_Confirmado_Por', 'Vale_Confirmado_Em'].forEach(function (c) {
    if (cab.indexOf(c) < 0) { sh.getRange(1, cab.length + 1).setValue(c); cab.push(c); }
  });
  const iId = cab.indexOf('ID_Auditoria');
  const ids = sh.getRange(2, iId + 1, sh.getLastRow() - 1, 1).getValues().map(function (l) { return String(l[0]); });
  const k = ids.indexOf(String(id));
  if (k < 0) throw new Error('Ocorrência não encontrada na planilha: ' + id);
  const lin = k + 2, quando = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  const por = status === 'Pendente' ? '' : (sessao.nome || '') + ' (' + sessao.matricula + ')';
  sh.getRange(lin, cab.indexOf('Status_Vale') + 1).setValue(status);
  sh.getRange(lin, cab.indexOf('Vale_Confirmado_Por') + 1).setValue(por);
  sh.getRange(lin, cab.indexOf('Vale_Confirmado_Em') + 1).setNumberFormat('@').setValue(status === 'Pendente' ? '' : quando);
  return { ok: true, id: String(id), status: status, por: por, em: status === 'Pendente' ? '' : quando };
}

function obterPasta() {
  const it = DriveApp.getFoldersByName(PASTA_FOTOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PASTA_FOTOS);
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ===================== Colaboradores cadastrados pelo app ===================== */
const ABA_COLAB = 'Colaboradores_Cadastro';
const ABA_ROTINA = 'Rotina_Retorno';

function abaComCabecalho(ss, nome, cab) {
  let sh = ss.getSheetByName(nome);
  if (!sh) { sh = ss.insertSheet(nome); sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold'); sh.setFrozenRows(1); }
  return sh;
}

function salvarColaboradores(lista, sessao) {
  const ss = abrirPlanilha(), sh = abaComCabecalho(ss, ABA_COLAB, ['Matricula', 'Nome', 'Funcao', 'Cadastrado_Por', 'Cadastrado_Em']);
  const ex = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues().forEach(function (l, i) { ex[String(l[0]).trim()] = i + 2; });
  let n = 0;
  (lista || []).forEach(function (a) {
    const m = String(a[0] || '').replace(/\D/g, ''), nome = String(a[1] || '').trim().toUpperCase(), f = String(a[2] || '').trim().toUpperCase();
    if (!m || !nome) return;
    if (ex[m]) { sh.getRange(ex[m], 2, 1, 2).setValues([[nome, f]]); return; }
    const lin = sh.getLastRow() + 1;
    sh.getRange(lin, 1, 1, 5).setNumberFormat('@').setValues([[m, nome, f, sessao.matricula, Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm')]]);
    ex[m] = lin; n++;
  });
  return { ok: true, adicionados: n };
}

function lerTabelaSimples(ss, nome, ncol) {
  const sh = ss.getSheetByName(nome);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, ncol).getDisplayValues().filter(function (l) { return String(l[0]).trim(); });
}

/* ===================== Rotina de retorno (relatório 8457) ===================== */
function salvarRotina(linhas, sessao) {
  const ss = abrirPlanilha(), cab = ['Data', 'Numero_OS', 'Codigo_Produto', 'Descricao_Produto', 'Quantidade', 'Rua_Origem', 'Matricula_Funcionario', 'Nome_Funcionario', 'Importado_Em', 'Importado_Por'];
  const sh = abaComCabecalho(ss, ABA_ROTINA, cab);
  const ex = new Set(sh.getLastRow() > 1 ? sh.getRange(2, 2, sh.getLastRow() - 1, 2).getDisplayValues().map(function (l) { return l[0] + '|' + l[1]; }) : []);
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'), novas = [];
  (linhas || []).forEach(function (a) {
    const k = String(a[1]) + '|' + String(a[2]);
    if (!a[1] || ex.has(k)) return;
    ex.add(k);
    novas.push([String(a[0] || ''), String(a[1]), String(a[2]), String(a[3] || ''), Number(a[4]) || 0, String(a[5] || ''), String(a[6] || ''), String(a[7] || ''), agora, sessao.matricula]);
  });
  if (novas.length) {
    const ini = sh.getLastRow() + 1;
    sh.getRange(ini, 1, novas.length, 3).setNumberFormat('@');
    sh.getRange(ini, 6, novas.length, 2).setNumberFormat('@');
    sh.getRange(ini, 1, novas.length, cab.length).setValues(novas);
  }
  return { ok: true, adicionados: novas.length, total: (linhas || []).length };
}

/** Linhas da rotina dos últimos N dias: [data, os, cod, desc, qtd, rua, matricula, nome]. */
function lerRotina(ss, dias) {
  const sh = ss.getSheetByName(ABA_ROTINA);
  if (!sh || sh.getLastRow() < 2) return [];
  const lim = new Date(); lim.setDate(lim.getDate() - dias);
  const limIso = Utilities.formatDate(lim, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return sh.getRange(2, 1, sh.getLastRow() - 1, 8).getDisplayValues().filter(function (l) { return l[1] && (!l[0] || l[0] >= limIso); });
}

/* ===================== Sobras de separação (rotina 8074) ===================== */
const CAB_SOBRAS = ['Data', 'Tipo', 'Numero_OS', 'Codigo_Produto', 'Descricao_Produto', 'Embalagem', 'Quantidade', 'Matricula_Conferente', 'Conferente',
  'Matricula_Separador', 'Separador', 'Operacao', 'Valor_Total', 'Chave', 'Importado_Em'];
/** Chave da regra da Expedição: O.S. + item + tipo + separador (linhas antigas sem tipo são sobras). */
function chaveSobra(l, cab) {
  const g = function (n) { const i = cab.indexOf(n); return i < 0 ? '' : String(l[i]).trim(); };
  return g('Numero_OS') + '|' + g('Codigo_Produto') + '|' + (g('Tipo') || 'Sobra') + '|' + (g('Matricula_Separador') || g('Separador'));
}
function abaSobras(ss) {
  const sh = ss.getSheets().filter(function (x) { return normalizar(x.getName()).indexOf('SOBRA') >= 0; })[0] || ss.insertSheet('Sobras_Separacao');
  if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, CAB_SOBRAS.length).setValues([CAB_SOBRAS]).setFontWeight('bold');
  const cab = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  CAB_SOBRAS.forEach(function (c) { if (cab.indexOf(c) < 0) { sh.getRange(1, cab.length + 1).setValue(c).setFontWeight('bold'); cab.push(c); } });
  return { sh: sh, cab: cab };
}
/** Remove linhas repetidas (mesma O.S. + mesmo item), mantendo a primeira. */
function removerDuplicatasSobras(sh, cab) {
  if (sh.getLastRow() < 3) return 0;
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, cab.length).getDisplayValues(), vistos = new Set(), apagar = [];
  const iT = cab.indexOf('Tipo');
  v.forEach(function (l, i) {
    if (iT >= 0 && String(l[iT]).trim() === 'Falta') { apagar.push(i + 2); return; } // só quantidade superior
    const k = chaveSobra(l, cab); if (vistos.has(k)) apagar.push(i + 2); else vistos.add(k);
  });
  for (let i = apagar.length - 1; i >= 0; i--) sh.deleteRow(apagar[i]);
  return apagar.length;
}
function salvarSobras(linhas, sessao) {
  const ss = abrirPlanilha(), A = abaSobras(ss), sh = A.sh, cab = A.cab;
  const removidas = removerDuplicatasSobras(sh, cab);
  const ex = new Set(sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, cab.length).getDisplayValues().map(function (l) { return chaveSobra(l, cab); }) : []);
  const agora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'), novas = [];
  (linhas || []).forEach(function (a) {
    if (!a || !a[1] || (a[12] && a[12] !== 'Sobra')) return;
    const tipo = 'Sobra', k = String(a[1]).trim() + '|' + String(a[2]).trim() + '|' + tipo + '|' + (String(a[7] || '').trim() || String(a[8] || '').trim());
    if (ex.has(k)) return; ex.add(k);
    const o = { Data: a[0], Tipo: tipo, Numero_OS: a[1], Codigo_Produto: a[2], Descricao_Produto: a[3], Embalagem: a[13] || '', Quantidade: Number(a[4]) || 0,
      Matricula_Conferente: a[5], Conferente: a[6], Matricula_Separador: a[7], Separador: a[8], Operacao: a[9], Valor_Total: Number(a[10]) || 0, Chave: k, Importado_Em: agora };
    novas.push(cab.map(function (h) { return o[h] === undefined ? '' : o[h]; }));
  });
  if (novas.length) {
    const ini = sh.getLastRow() + 1;
    ['Data', 'Numero_OS', 'Codigo_Produto', 'Matricula_Conferente', 'Matricula_Separador', 'Chave'].forEach(function (c) { const i = cab.indexOf(c); if (i >= 0) sh.getRange(ini, i + 1, novas.length, 1).setNumberFormat('@'); });
    sh.getRange(ini, 1, novas.length, cab.length).setValues(novas);
  }
  return { ok: true, adicionados: novas.length, duplicatasRemovidas: removidas, aba: sh.getName() };
}
/** [data, os, cod, desc, qtd, matConf, conf, matSep, sep, operacao, valor, chave, tipo, embalagem] */
function lerSobras(ss) {
  const sh = ss.getSheets().filter(function (x) { return normalizar(x.getName()).indexOf('SOBRA') >= 0; })[0];
  if (!sh || sh.getLastRow() < 2) return [];
  const v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues(), cab = v[0];
  const ix = ['Data', 'Numero_OS', 'Codigo_Produto', 'Descricao_Produto', 'Quantidade', 'Matricula_Conferente', 'Conferente', 'Matricula_Separador', 'Separador', 'Operacao', 'Valor_Total', 'Chave', 'Tipo', 'Embalagem'].map(function (c) { return cab.indexOf(c); });
  return v.slice(1).filter(function (l) { return ix[1] >= 0 && l[ix[1]]; }).map(function (l) { return ix.map(function (k) { return k < 0 ? '' : l[k]; }); });
}

/* ===================== Painel e fechamento ===================== */

/** Lê colunas escolhidas de uma aba (sem fotos). */
function lerAba(ss, nome, campos) {
  const sh = ss.getSheetByName(nome);
  if (!sh || sh.getLastRow() < 2) return { colunas: campos, registros: [] };
  const dados = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const cab = dados[0].map(String);
  const idx = campos.map(function (c) { return cab.indexOf(c); });
  const regs = [];
  for (let i = 1; i < dados.length; i++) {
    const l = dados[i];
    if (idx[0] < 0 || !l[idx[0]]) continue;
    regs.push(idx.map(function (k) {
      if (k < 0) return '';
      const v = l[k];
      return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss') : v;
    }));
  }
  return { colunas: campos, registros: regs };
}

function listarRegistros(ss) {
  const campos = ['ID_Auditoria', 'DataHora', 'Nome_Auditor', 'Endereco', 'Rua', 'Possui_NC', 'Erro_Produto',
    'Prox_Vencimento', 'Sem_Saldo', 'Avaria', 'Qtd_Divergencia_Un', 'Valor_Divergencia',
    'Matricula_Colaborador_NC', 'Nome_Colaborador_NC', 'Status_NC', 'ID_Sessao', 'Recebido_Em'];
  const quadro = lerQuadro(ss);
  const sh = ss.getSheetByName(ABAS.ruas.nome);
  if (!sh || sh.getLastRow() < 2) return resposta({ ok: true, colunas: campos, registros: [], quadro: quadro });
  const dados = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getValues();
  const cab = dados[0].map(String);
  const idx = campos.map(function (c) { return cab.indexOf(c); });
  const regs = [];
  for (let i = 1; i < dados.length; i++) {
    const l = dados[i];
    if (idx[0] < 0 || !l[idx[0]]) continue;
    regs.push(idx.map(function (k) {
      if (k < 0) return '';
      const v = l[k];
      return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss') : v;
    }));
  }
  return resposta({ ok: true, colunas: campos, registros: regs, quadro: quadro });
}

const QUADRO_PADRAO = [
  ['10003926', 'FABIANNE MATURANO DE LUCENA ALVES', 'SUPORTE', ''],
  ['10003936', 'GRAZIELA PEREIRA DA SILVA', 'REPOSITOR', '29, 30'],
  ['10003932', 'ALICE KAUANE PEREIRA SILVA', 'REPOSITOR', '24'],
  ['10003925', 'ANA CAROLINA DE ALCANTARA FERREIRA', 'REPOSITOR', '43, 44'],
  ['10003615', 'CARLOS ANTONIO DOS SANTOS', 'REPOSITOR', '4'],
  ['10003639', 'CLEITON CARDOSO DA SILVA', 'REPOSITOR', '38, 39, 40'],
  ['10002347', 'EDIO JOSE DE SOUZA', 'REPOSITOR', '20, 22'],
  ['10003850', 'ESDRAS SOUZA ARAUJO', 'REPOSITOR', '16, 17'],
  ['10003902', 'FRANCIMAR ABADE DA SILVA', 'REPOSITOR', '27, 28'],
  ['10003413', 'GABRIEL FILLIPE DOS SANTOS FERREIRA', 'REPOSITOR', '41, 42'],
  ['10003748', 'HALLYSON DE SOUSA DELMONDES', 'REPOSITOR', '8, 9'],
  ['10003193', 'JOSE RODRIGUES DA SILVA FILHO', 'REPOSITOR', '2, 3'],
  ['10003928', 'KETNEY CRISTINE ALVES DOS SANTOS', 'REPOSITOR', '25, 26'],
  ['10001781', 'LEANDRO SOARES LOPES', 'REPOSITOR', '5, 6, 7'],
  ['10003942', 'NAIARA GONCALVES DOS SANTOS', 'REPOSITOR', '10, 11'],
  ['10003930', 'NATHAN ALVES DE OLIVEIRA', 'REPOSITOR', '34, 35'],
  ['10003961', 'NICACIO GUILHERME DOS SANTOS', 'REPOSITOR', '36, 37'],
  ['10003316', 'PAULO CESAR ALVES VIANA', 'REPOSITOR', '45, 46'],
  ['10003643', 'TIAGO VITO PEREIRA MELO', 'REPOSITOR', '23'],
  ['10003787', 'WAGNER HENRIQUE ALVES', 'REPOSITOR', '11, 12'],
  ['10003993', 'FABIO NYCKOLAS FIGUEIREDO BOTERO', 'LIDER', ''],
  ['10004015', 'CAIO GABRIEL ANDRADE DE HOLANDA', 'REPOSITOR', '31, 32'],
  ['10003995', 'HELIANO HOLANDA E SILVA CASTRO', 'REPOSITOR', '18, 19'],
  ['10002871', 'RONNY KENDSON RAMALHO SILVA', 'AUXILIAR', '']
];

function lerQuadro(ss) {
  let sh = ss.getSheetByName(ABA_QUADRO);
  if (!sh) {
    sh = ss.insertSheet(ABA_QUADRO);
    sh.getRange(1, 1, 1, 4).setValues([['Matricula', 'Nome', 'Funcao', 'Ruas']]).setFontWeight('bold');
    sh.getRange(2, 1, QUADRO_PADRAO.length, 4).setNumberFormat('@').setValues(QUADRO_PADRAO);
    sh.setFrozenRows(1);
  }
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 4).getDisplayValues()
    .filter(function (l) { return String(l[0]).trim(); });
}

/* ===================== Auditoria de cargas ===================== */

/** Rode UMA vez pelo editor: cria/ajusta os títulos da aba Auditoria_Cargas e a lista de motivos. */
function prepararAbaCargas() {
  const ss = abrirPlanilha(), cfg = ABAS.cargas;
  const sh = ss.getSheetByName(cfg.nome) || ss.insertSheet(cfg.nome);
  const ultCol = Math.max(sh.getLastColumn(), 1);
  const atuais = sh.getLastRow() ? sh.getRange(1, 1, 1, ultCol).getDisplayValues()[0].map(String) : [];
  const temDados = sh.getLastRow() > 1;
  if (!temDados) {
    sh.getRange(1, 1, 1, cfg.colunas.length).setValues([cfg.colunas]);
    if (ultCol > cfg.colunas.length) sh.getRange(1, cfg.colunas.length + 1, 1, ultCol - cfg.colunas.length).clearContent();
  } else {
    cfg.colunas.forEach(function (c) { if (atuais.indexOf(c) < 0) { atuais.push(c); sh.getRange(1, atuais.length).setValue(c); } });
  }
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
  sh.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#0A4DA2').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  cfg.texto.forEach(function (c) { const i = cab.indexOf(c); if (i >= 0) sh.getRange(2, i + 1, sh.getMaxRows() - 1, 1).setNumberFormat('@'); });
  const iMot = cab.indexOf('Motivo');
  if (iMot >= 0) {
    const regra = SpreadsheetApp.newDataValidation().requireValueInList(MOTIVOS_CARGA, true).setAllowInvalid(false)
      .setHelpText('Escolha: Falta, Avaria, Abastecimento, Sobras, Produto trocado ou Produto próximo ao vencimento').build();
    sh.getRange(2, iMot + 1, sh.getMaxRows() - 1, 1).setDataValidation(regra);
  }
  sh.autoResizeColumns(1, cab.length);
  Logger.log('Aba Auditoria_Cargas pronta: ' + cab.join(' | '));
}

/* ===================== Testes pelo editor ===================== */

function autorizar() {
  Logger.log('Planilha: ' + abrirPlanilha().getName());
  Logger.log('Pasta de fotos: ' + obterPasta().getName());
  Logger.log('Matrículas com permissão: ' + Object.keys(lerPermissoes()).join(', '));
  segredo();
}

function testeLogin() {
  const mapa = lerPermissoes(), mat = Object.keys(mapa)[0];
  Logger.log(JSON.stringify(login(mat, mapa[mat].senhas[0])));
}

function testeGravacao() {
  const ss = abrirPlanilha(), agora = new Date().getTime();
  gravar(ss, ABAS.ruas, [{ ID_Auditoria: 'TESTE-RUA-' + agora, DataHora: new Date().toLocaleString('pt-BR'), Nome_Auditor: 'TESTE', Endereco: '1-1-1-1', Observacao: 'Teste – pode apagar', Status_NC: 'Conforme' }]);
  gravar(ss, ABAS.cargas, [{ ID_Auditoria: 'TESTE-CAR-' + agora, DataHora: new Date().toLocaleString('pt-BR'), Nome_Auditor: 'TESTE', Box: '1', Numero_OS: '0', Codigo_Produto: '338', Quantidade: 1, Motivo: 'Falta', Valor_Total: 3.02 }]);
  gravar(ss, ABAS.retorno, [{ ID_Auditoria: 'TESTE-RET-' + agora, DataHora: new Date().toLocaleString('pt-BR'), Nome_Auditor: 'TESTE', Produto: '338', Rua: '44', Observacao: 'Teste – pode apagar', Status_NC: 'Conforme' }]);
  Logger.log('Linhas de teste gravadas em Auditoria_Ruas e Auditoria_Retorno.');
}
