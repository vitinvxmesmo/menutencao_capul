// ============================================
// CAPUL TI - SISTEMA DE GESTÃO DE MANUTENÇÃO
// VERSÃO 3.0.0 - COMPLETA
// ============================================

// ===== CONFIGURAÇÕES =====
const CONFIG = {
    SENHA: '@*ihtc39',
    USUARIOS: [
        'Lucas Marcelino',
        'Fernando Santos',
        'Gustavo Pereira',
        'Matheus Lucca',
        'Thiago Oliveira',
        'Victor Oliveira'
    ],
    DB_KEY: 'capul_ti_db',
    LOGIN_KEY: 'capul_ti_user',
    REMEMBER_KEY: 'capul_ti_remember',
    VERSAO: '3.0.0'
};

// ===== ESTADO GLOBAL =====
let ordens = [];
let usuarioAtual = null;
let osSelecionadaExclusao = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    verificarLoginSalvo();
    configurarEventListeners();
    criarModais();
});

// ===== PERSISTÊNCIA DE DADOS =====
function carregarDados() {
    try {
        const dados = localStorage.getItem(CONFIG.DB_KEY);
        if (dados) {
            ordens = JSON.parse(dados);
            console.log(`✅ ${ordens.length} OS carregadas`);
        } else {
            ordens = gerarDadosExemplo();
            salvarDados();
            console.log('📁 Dados de exemplo gerados');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        ordens = gerarDadosExemplo();
        salvarDados();
    }
}

function gerarDadosExemplo() {
    return [
        {
            id: Date.now() - 86400000 * 10,
            numero: 'OS-1001',
            data: '10/03/2026',
            hora: '09:30',
            cliente: 'João Silva',
            telefone: '(38) 99999-1111',
            equipamento: 'Notebook Dell Inspiron 15',
            tipo: 'Visita Técnica',
            defeito: 'Computador não liga, fonte queimada',
            obs: 'Cliente deixou carregador',
            status: 'Finalizado',
            tecnico: 'Matheus Lucca',
            data_finalizacao: '15/03/2026',
            hora_finalizacao: '14:20',
            servicos_realizados: ['Troca de fonte', 'Limpeza interna', 'Testes de estabilidade'],
            pecas_utilizadas: ['Fonte 500w real', 'Pasta térmica'],
            criado_por: 'Lucas Marcelino',
            historico: [
                { data: '10/03/2026', hora: '09:30', usuario: 'Lucas Marcelino', acao: 'OS Criada' },
                { data: '15/03/2026', hora: '14:20', usuario: 'Matheus Lucca', acao: 'OS Finalizada' }
            ]
        },
        {
            id: Date.now() - 86400000 * 5,
            numero: 'OS-1002',
            data: '12/03/2026',
            hora: '14:15',
            cliente: 'Maria Oliveira',
            telefone: '(38) 99999-2222',
            equipamento: 'Desktop Positivo',
            tipo: 'Manutenção Corretiva',
            defeito: 'Computador lento e travando',
            obs: 'Cliente relatou barulho na ventoinha',
            status: 'Em Manutenção',
            tecnico: 'Lucas Marcelino',
            servicos_realizados: ['Formatação', 'Troca de ventoinha', 'Limpeza'],
            pecas_utilizadas: ['Ventoinha 120mm'],
            criado_por: 'Fernando Santos',
            historico: [
                { data: '12/03/2026', hora: '14:15', usuario: 'Fernando Santos', acao: 'OS Criada' },
                { data: '13/03/2026', hora: '10:30', usuario: 'Lucas Marcelino', acao: 'Status alterado: Aguardando → Em Manutenção' }
            ]
        },
        {
            id: Date.now() - 86400000 * 2,
            numero: 'OS-1003',
            data: '15/03/2026',
            hora: '11:00',
            cliente: 'Pedro Santos',
            telefone: '(38) 99999-3333',
            equipamento: 'iPhone 13',
            tipo: 'Urgente',
            defeito: 'Tela quebrada',
            obs: 'Cliente precisa com urgência',
            status: 'Aguardando',
            tecnico: null,
            criado_por: 'Gustavo Pereira',
            historico: [
                { data: '15/03/2026', hora: '11:00', usuario: 'Gustavo Pereira', acao: 'OS Criada' }
            ]
        },
        {
            id: Date.now() - 86400000 * 7,
            numero: 'OS-1004',
            data: '18/03/2026',
            hora: '16:45',
            cliente: 'Ana Costa',
            telefone: '(38) 99999-4444',
            equipamento: 'Monitor LG 24"',
            tipo: 'Garantia',
            defeito: 'Monitor sem imagem',
            obs: 'Em garantia, acionar fabricante',
            status: 'Finalizado',
            tecnico: 'Fernando Santos',
            data_finalizacao: '20/03/2026',
            hora_finalizacao: '10:15',
            servicos_realizados: ['Acionamento de garantia', 'Substituição do monitor'],
            pecas_utilizadas: ['Monitor novo'],
            criado_por: 'Thiago Oliveira',
            historico: [
                { data: '18/03/2026', hora: '16:45', usuario: 'Thiago Oliveira', acao: 'OS Criada' },
                { data: '20/03/2026', hora: '10:15', usuario: 'Fernando Santos', acao: 'OS Finalizada' }
            ]
        },
        {
            id: Date.now() - 86400000 * 3,
            numero: 'OS-1005',
            data: '20/03/2026',
            hora: '13:20',
            cliente: 'Carlos Ferreira',
            telefone: '(38) 99999-5555',
            equipamento: 'Impressora Epson L3250',
            tipo: 'Visita Técnica',
            defeito: 'Impressora não imprime, luz piscando',
            obs: 'Cliente já trocou cartuchos',
            status: 'Em Manutenção',
            tecnico: 'Victor Oliveira',
            servicos_realizados: ['Limpeza de cabeçote', 'Alinhamento'],
            pecas_utilizadas: [],
            criado_por: 'Matheus Lucca',
            historico: [
                { data: '20/03/2026', hora: '13:20', usuario: 'Matheus Lucca', acao: 'OS Criada' },
                { data: '21/03/2026', hora: '09:00', usuario: 'Victor Oliveira', acao: 'Status alterado: Aguardando → Em Manutenção' }
            ]
        }
    ];
}

function salvarDados() {
    try {
        localStorage.setItem(CONFIG.DB_KEY, JSON.stringify(ordens));
        console.log('💾 Dados salvos com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        mostrarNotificacao('Erro ao salvar dados', 'error');
        return false;
    }
}

function fazerBackup() {
    const backup = {
        metadados: {
            sistema: 'CAPUL TI',
            versao: CONFIG.VERSAO,
            usuario: usuarioAtual,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR'),
            total_os: ordens.length
        },
        ordens: ordens
    };
    
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_capul_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacao('✅ Backup realizado com sucesso!', 'success');
}

function exportarBackup() {
    fazerBackup();
}

// ===== SISTEMA DE LOGIN =====
function verificarLoginSalvo() {
    const remember = localStorage.getItem(CONFIG.REMEMBER_KEY);
    const usuarioSalvo = localStorage.getItem(CONFIG.LOGIN_KEY);
    
    if (remember === 'true' && usuarioSalvo) {
        usuarioAtual = usuarioSalvo;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-system').classList.remove('hidden');
        document.getElementById('userName').innerText = usuarioAtual.split(' ')[0];
        renderizarOS();
        atualizarStats();
        mostrarNotificacao(`Bem-vindo de volta, ${usuarioAtual.split(' ')[0]}!`, 'success');
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const manterConectado = document.getElementById('manterConectado').checked;
    
    if (!usuario) {
        mostrarNotificacao('Selecione um usuário!', 'warning');
        return;
    }
    
    if (senha !== CONFIG.SENHA) {
        mostrarNotificacao('Senha incorreta!', 'error');
        return;
    }
    
    usuarioAtual = usuario;
    
    if (manterConectado) {
        localStorage.setItem(CONFIG.LOGIN_KEY, usuario);
        localStorage.setItem(CONFIG.REMEMBER_KEY, 'true');
    } else {
        sessionStorage.setItem(CONFIG.LOGIN_KEY, usuario);
    }
    
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-system').classList.remove('hidden');
    document.getElementById('userName').innerText = usuario.split(' ')[0];
    
    renderizarOS();
    atualizarStats();
    mostrarNotificacao(`Bem-vindo, ${usuario.split(' ')[0]}!`, 'success');
    
    document.getElementById('senha').value = '';
});

function logout() {
    localStorage.removeItem(CONFIG.LOGIN_KEY);
    localStorage.removeItem(CONFIG.REMEMBER_KEY);
    sessionStorage.removeItem(CONFIG.LOGIN_KEY);
    usuarioAtual = null;
    
    document.getElementById('main-system').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    
    mostrarNotificacao('Logout realizado com sucesso!', 'info');
}

function togglePassword() {
    const senhaInput = document.getElementById('senha');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        senhaInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// ===== CRUD DE ORDENS =====
document.getElementById('osForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const novaOS = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        numero: `OS-${Math.floor(Math.random() * 9000 + 1000)}`,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        cliente: formData.get('cliente'),
        telefone: formData.get('telefone'),
        equipamento: formData.get('equipamento'),
        tipo: formData.get('tipo'),
        defeito: formData.get('defeito'),
        obs: formData.get('obs'),
        status: 'Aguardando',
        tecnico: null,
        data_finalizacao: null,
        hora_finalizacao: null,
        servicos_realizados: [],
        pecas_utilizadas: [],
        criado_por: usuarioAtual,
        historico: [{
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            usuario: usuarioAtual,
            acao: 'OS Criada'
        }]
    };
    
    ordens.unshift(novaOS);
    
    if (salvarDados()) {
        e.target.reset();
        toggleModal('modal-os');
        renderizarOS();
        atualizarStats();
        mostrarNotificacao('✅ OS criada com sucesso!', 'success');
    }
});

// ===== RENDERIZAR OS =====
function renderizarOS() {
    const grid = document.getElementById('osGrid');
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';
    const filterTecnico = document.getElementById('filterTecnico')?.value || 'all';
    const filterMonth = document.getElementById('filterMonth')?.value || 'all';
    const filterYear = document.getElementById('filterYear')?.value || 'all';
    
    let osFiltradas = ordens.filter(os => {
        if (search && !os.cliente?.toLowerCase().includes(search) && 
            !os.equipamento?.toLowerCase().includes(search) && 
            !os.tecnico?.toLowerCase().includes(search)) {
            return false;
        }
        
        if (filterStatus !== 'all' && os.status !== filterStatus) return false;
        if (filterTecnico !== 'all' && os.tecnico !== filterTecnico) return false;
        
        if (os.data) {
            const partes = os.data.split('/');
            const osMes = partes[1];
            const osAno = partes[2];
            
            if (filterMonth !== 'all' && osMes !== filterMonth) return false;
            if (filterYear !== 'all' && osAno !== filterYear) return false;
        }
        
        return true;
    });
    
    if (osFiltradas.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Nenhuma ordem de serviço encontrada</p>
                <button onclick="toggleModal('modal-os')" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Criar Nova OS
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = osFiltradas.map(os => criarCardOS(os)).join('');
}

function criarCardOS(os) {
    const statusClass = 
        os.status === 'Finalizado' ? 'status-finalizado' : 
        os.status === 'Em Manutenção' ? 'status-manutencao' : 
        'status-aguardando';
    
    return `
        <div class="os-card animate-slideIn" data-os-id="${os.id}">
            <div class="os-card-header">
                <div>
                    <span class="os-id">#${os.numero || 'OS-' + os.id.toString().slice(-6)}</span>
                    <h4 class="os-client">
                        <i class="fas fa-user" style="color: #1a7a44;"></i>
                        ${os.cliente || 'Cliente não informado'}
                    </h4>
                    <p class="os-equipment">
                        <i class="fas fa-desktop"></i>
                        ${os.equipamento || 'Equipamento não informado'}
                    </p>
                </div>
                <span class="os-status-badge ${statusClass}">
                    ${os.status || 'Aguardando'}
                </span>
            </div>
            
            <div class="os-card-body">
                <div class="os-defect">
                    "${os.defeito?.substring(0, 120) || 'Defeito não informado'}${os.defeito?.length > 120 ? '...' : ''}"
                </div>
                
                <div class="os-meta">
                    <span><i class="fas fa-calendar"></i> ${os.data || '—'}</span>
                    ${os.tecnico ? `<span><i class="fas fa-user-cog"></i> ${os.tecnico}</span>` : ''}
                    ${os.tipo ? `<span><i class="fas fa-tag"></i> ${os.tipo}</span>` : ''}
                </div>
                
                ${os.servicos_realizados?.length > 0 ? `
                    <div style="font-size: 0.75rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed #e5e7eb;">
                        <span style="color: #1a7a44; font-weight: 600;">
                            <i class="fas fa-tools"></i> Serviços:
                        </span>
                        ${os.servicos_realizados.map(s => `<span style="background: #e8f5e9; padding: 0.2rem 0.5rem; border-radius: 1rem; margin: 0.25rem; display: inline-block; font-size: 0.7rem;">${s}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="os-card-footer">
                <div class="os-actions">
                    <button onclick="gerarPDF(${os.id})" class="os-btn os-btn-pdf" title="Gerar PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                    <button onclick="abrirModalExclusao(${os.id}, '${os.cliente?.replace(/'/g, "\\'") || 'OS'}')" class="os-btn os-btn-delete" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                
                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                    <select onchange="alterarStatus(${os.id}, this.value)" class="os-status-select" ${os.status === 'Finalizado' ? 'disabled' : ''}>
                        <option value="Aguardando" ${os.status === 'Aguardando' ? 'selected' : ''}>⏳ Aguardando</option>
                        <option value="Em Manutenção" ${os.status === 'Em Manutenção' ? 'selected' : ''}>🔧 Em Manutenção</option>
                        <option value="Finalizado" ${os.status === 'Finalizado' ? 'selected' : ''}>✅ Finalizado</option>
                    </select>
                    <span class="os-date">
                        <i class="far fa-calendar-alt"></i> ${os.data || '—'}
                    </span>
                </div>
            </div>
            
            ${os.data_finalizacao ? `
                <div style="background: #ecfdf5; padding: 0.5rem 1.25rem; border-top: 1px solid #c6e9d2; font-size: 0.7rem; color: #065f46; display: flex; justify-content: space-between;">
                    <span><i class="fas fa-check-circle"></i> Finalizado: ${os.data_finalizacao} ${os.hora_finalizacao || ''}</span>
                    <span><i class="fas fa-user-cog"></i> ${os.tecnico || '—'}</span>
                </div>
            ` : ''}
            
            <div style="padding: 0.5rem 1.25rem; background: #f9fafb; font-size: 0.65rem; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <i class="fas fa-user-clock"></i> Criado por ${os.criado_por || 'Sistema'} • ${os.hora || ''}
            </div>
        </div>
    `;
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarStats() {
    const total = ordens.length;
    const aguardando = ordens.filter(o => o.status === 'Aguardando').length;
    const emManutencao = ordens.filter(o => o.status === 'Em Manutenção').length;
    const finalizadas = ordens.filter(o => o.status === 'Finalizado').length;
    
    document.getElementById('stat-pending').innerText = aguardando;
    document.getElementById('stat-progress').innerText = emManutencao;
    document.getElementById('stat-done').innerText = finalizadas;
    document.getElementById('stat-total').innerText = total;
}

// ===== ALTERAR STATUS =====
function alterarStatus(id, novoStatus) {
    const index = ordens.findIndex(o => o.id === id);
    if (index === -1) return;
    
    const statusAntigo = ordens[index].status;
    
    if (novoStatus === 'Finalizado' && statusAntigo !== 'Finalizado') {
        abrirModalFinalizar(id);
        return;
    }
    
    ordens[index].status = novoStatus;
    
    if (!ordens[index].historico) ordens[index].historico = [];
    ordens[index].historico.push({
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        usuario: usuarioAtual,
        acao: `Status alterado: ${statusAntigo} → ${novoStatus}`
    });
    
    if (salvarDados()) {
        renderizarOS();
        atualizarStats();
        mostrarNotificacao(`Status alterado para "${novoStatus}"`, 'info');
    }
}

// ===== FINALIZAR OS =====
function abrirModalFinalizar(id) {
    document.getElementById('finalizar_os_id').value = id;
    toggleModal('modal-finalizar');
}

document.getElementById('finalizarForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const osId = parseInt(formData.get('os_id'));
    const index = ordens.findIndex(o => o.id === osId);
    
    if (index === -1) return;
    
    const servicos = formData.get('servicos_realizados')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
    const pecas = formData.get('pecas_utilizadas')
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    ordens[index].status = 'Finalizado';
    ordens[index].tecnico = formData.get('tecnico');
    ordens[index].servicos_realizados = servicos;
    ordens[index].pecas_utilizadas = pecas;
    ordens[index].data_finalizacao = new Date().toLocaleDateString('pt-BR');
    ordens[index].hora_finalizacao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    ordens[index].finalizado_por = usuarioAtual;
    
    if (!ordens[index].historico) ordens[index].historico = [];
    ordens[index].historico.push({
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        usuario: usuarioAtual,
        acao: 'OS Finalizada',
        tecnico: formData.get('tecnico')
    });
    
    if (salvarDados()) {
        toggleModal('modal-finalizar');
        renderizarOS();
        atualizarStats();
        mostrarNotificacao('✅ OS finalizada com sucesso!', 'success');
    }
});

// ===== EXCLUIR OS =====
function abrirModalExclusao(id, cliente) {
    osSelecionadaExclusao = id;
    document.getElementById('deleteOsInfo').innerHTML = `
        <strong>OS #${id.toString().slice(-6)}</strong><br>
        Cliente: ${cliente}
    `;
    toggleModal('modal-delete');
}

document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
    if (osSelecionadaExclusao) {
        const index = ordens.findIndex(o => o.id === osSelecionadaExclusao);
        
        if (index !== -1) {
            const osExcluida = ordens[index];
            ordens.splice(index, 1);
            
            if (salvarDados()) {
                toggleModal('modal-delete');
                renderizarOS();
                atualizarStats();
                mostrarNotificacao(`🗑️ OS #${osExcluida.numero || osExcluida.id.toString().slice(-6)} excluída!`, 'success');
                osSelecionadaExclusao = null;
            }
        }
    }
});

// ===== GERAR PDF =====
// ===== GERAR PDF - CORRIGIDO =====
function gerarPDF(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;
    
    // Criar elemento para o PDF
    const elementoPDF = document.createElement('div');
    elementoPDF.id = 'pdf-content-' + id;
    elementoPDF.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 210mm;
        min-height: 297mm;
        background: white;
        padding: 15mm;
        font-family: Arial, sans-serif;
        box-sizing: border-box;
        z-index: -9999;
        opacity: 0;
        pointer-events: none;
    `;
    
    // Formatar serviços e peças
    const servicosHTML = os.servicos_realizados?.length > 0 
        ? os.servicos_realizados.map(s => `<tr><td style="padding: 4px 0; font-size: 11px;">• ${s}</td></tr>`).join('')
        : '<tr><td style="padding: 4px 0; font-size: 11px; color: #666;">Nenhum serviço registrado</td></tr>';
    
    const pecasHTML = os.pecas_utilizadas?.length > 0
        ? os.pecas_utilizadas.map(p => `<tr><td style="padding: 4px 0; font-size: 11px;">• ${p}</td></tr>`).join('')
        : '<tr><td style="padding: 4px 0; font-size: 11px; color: #666;">Nenhuma peça utilizada</td></tr>';
    
    // CONTEÚDO DO PDF - OTIMIZADO PARA UMA PÁGINA A4
    elementoPDF.innerHTML = `
        <div style="max-width: 180mm; margin: 0 auto; background: white;">
            <!-- CABEÇALHO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10mm; padding-bottom: 5mm; border-bottom: 3px solid #1a7a44;">
                <div>
                    <h1 style="font-size: 24px; font-weight: 800; color: #1a7a44; margin: 0 0 3px 0;">CAPUL TI</h1>
                    <p style="color: #4b5563; margin: 0; font-size: 11px;">Cooperativa Agropecuária de Unaí</p>
                    <p style="color: #6b7280; margin: 2px 0 0 0; font-size: 9px;">Manutenção de TI</p>
                </div>
                <div style="text-align: right;">
                    <div style="background: #1a7a44; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 11px; display: inline-block; margin-bottom: 5px;">
                        ORDEM DE SERVIÇO
                    </div>
                    <p style="font-weight: 700; font-size: 14px; margin: 2px 0;">${os.numero || 'OS-' + os.id.toString().slice(-6)}</p>
                    <p style="color: #6b7280; font-size: 10px; margin: 0;">${os.data} às ${os.hora}</p>
                </div>
            </div>
            
            <!-- GRID CLIENTE/EQUIPAMENTO - MAIS COMPACTO -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; margin-bottom: 8mm;">
                <div style="background: #f9fafb; padding: 5mm; border-radius: 4px; border-left: 4px solid #1a7a44;">
                    <h3 style="font-weight: 700; color: #1a7a44; margin: 0 0 4mm 0; font-size: 12px; display: flex; align-items: center; gap: 3px;">
                        <i class="fas fa-user"></i> CLIENTE
                    </h3>
                    <p style="margin: 0 0 3px 0; font-size: 11px;"><strong>Nome:</strong> ${os.cliente || '—'}</p>
                    <p style="margin: 0; font-size: 11px;"><strong>Telefone:</strong> ${os.telefone || '—'}</p>
                </div>
                <div style="background: #f9fafb; padding: 5mm; border-radius: 4px; border-left: 4px solid #1a7a44;">
                    <h3 style="font-weight: 700; color: #1a7a44; margin: 0 0 4mm 0; font-size: 12px; display: flex; align-items: center; gap: 3px;">
                        <i class="fas fa-desktop"></i> EQUIPAMENTO
                    </h3>
                    <p style="margin: 0 0 3px 0; font-size: 11px;"><strong>Equip.:</strong> ${os.equipamento || '—'}</p>
                    <p style="margin: 0; font-size: 11px;"><strong>Tipo:</strong> ${os.tipo || '—'}</p>
                </div>
            </div>
            
            <!-- DEFEITO - COMPACTO -->
            <div style="margin-bottom: 6mm;">
                <h3 style="font-weight: 700; color: #1a7a44; border-bottom: 2px solid #FFD700; padding-bottom: 2mm; margin: 0 0 4mm 0; font-size: 12px;">
                    <i class="fas fa-exclamation-triangle"></i> DEFEITO RELATADO
                </h3>
                <div style="background: #ecfdf5; padding: 4mm; border-radius: 4px; border-left: 4px solid #1a7a44; font-size: 11px; line-height: 1.5;">
                    ${os.defeito?.replace(/\n/g, '<br>') || 'Não informado'}
                </div>
            </div>
            
            <!-- SERVIÇOS E PEÇAS - LADO A LADO PARA ECONOMIZAR ESPAÇO -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-bottom: 6mm;">
                <div>
                    <h3 style="font-weight: 700; color: #1a7a44; border-bottom: 2px solid #FFD700; padding-bottom: 2mm; margin: 0 0 3mm 0; font-size: 12px;">
                        <i class="fas fa-tools"></i> SERVIÇOS
                    </h3>
                    <div style="background: #f3f4f6; padding: 4mm; border-radius: 4px; max-height: 50mm; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                            ${servicosHTML}
                        </table>
                    </div>
                </div>
                <div>
                    <h3 style="font-weight: 700; color: #1a7a44; border-bottom: 2px solid #FFD700; padding-bottom: 2mm; margin: 0 0 3mm 0; font-size: 12px;">
                        <i class="fas fa-microchip"></i> PEÇAS
                    </h3>
                    <div style="background: #f3f4f6; padding: 4mm; border-radius: 4px; max-height: 50mm; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                            ${pecasHTML}
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- TÉCNICO E DATAS - COMPACTO -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-bottom: 6mm;">
                <div style="background: #f0fdf4; padding: 4mm; border-radius: 4px;">
                    <h3 style="font-weight: 700; color: #1a7a44; margin: 0 0 3mm 0; font-size: 12px;">
                        <i class="fas fa-user-cog"></i> TÉCNICO
                    </h3>
                    <p style="font-size: 13px; font-weight: 600; color: #1a7a44; margin: 0;">
                        ${os.tecnico || 'Não atribuído'}
                    </p>
                </div>
                <div style="background: #f0fdf4; padding: 4mm; border-radius: 4px;">
                    <h3 style="font-weight: 700; color: #1a7a44; margin: 0 0 3mm 0; font-size: 12px;">
                        <i class="fas fa-calendar-check"></i> DATAS
                    </h3>
                    <p style="margin: 0 0 2px 0; font-size: 11px;"><strong>Abertura:</strong> ${os.data} ${os.hora}</p>
                    ${os.data_finalizacao ? `<p style="margin: 0; font-size: 11px;"><strong>Finalização:</strong> ${os.data_finalizacao} ${os.hora_finalizacao || ''}</p>` : ''}
                </div>
            </div>
            
            <!-- OBSERVAÇÕES - COMPACTO -->
            <div style="margin-bottom: 8mm;">
                <h3 style="font-weight: 700; color: #1a7a44; border-bottom: 2px solid #FFD700; padding-bottom: 2mm; margin: 0 0 3mm 0; font-size: 12px;">
                    <i class="fas fa-sticky-note"></i> OBSERVAÇÕES
                </h3>
                <div style="background: #f9fafb; padding: 4mm; border-radius: 4px; font-size: 11px; line-height: 1.5;">
                    ${os.obs?.replace(/\n/g, '<br>') || 'Nenhuma observação registrada.'}
                </div>
            </div>
            
            <!-- AVISO - COMPACTO -->
            <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 3mm; border-radius: 4px; text-align: center; margin-bottom: 6mm;">
                <p style="color: #856404; font-weight: 600; margin: 0; font-size: 10px;">
                    ⚠️ DOCUMENTO SEM VALOR COMERCIAL - USO INTERNO
                </p>
            </div>
            
            <!-- ASSINATURAS - COMPACTO -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 5mm;">
                <div style="text-align: center;">
                    <div style="border-top: 2px solid #1f2937; padding-top: 3mm;">
                        <p style="font-weight: 600; margin: 0 0 2px 0; font-size: 11px;">${os.tecnico || '____________________'}</p>
                        <p style="color: #6b7280; font-size: 9px; margin: 0;">Assinatura do Técnico</p>
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="border-top: 2px solid #1f2937; padding-top: 3mm;">
                        <p style="font-weight: 600; margin: 0 0 2px 0; font-size: 11px;">${os.cliente || '____________________'}</p>
                        <p style="color: #6b7280; font-size: 9px; margin: 0;">Assinatura do Cliente</p>
                    </div>
                </div>
            </div>
            
            <!-- RODAPÉ - COMPACTO -->
            <div style="margin-top: 8mm; text-align: center; color: #9ca3af; font-size: 8px; padding-top: 3mm; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 2px 0;">CAPUL TI - Cooperativa Agropecuária de Unaí</p>
                <p style="margin: 0;">Gerado por ${usuarioAtual || 'Sistema'} em ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(elementoPDF);
    
    // Configuração EXATA para UMA PÁGINA A4
    const opt = {
        margin: [0, 0, 0, 0],
        filename: `OS_${os.numero || os.id}_${os.cliente?.replace(/\s+/g, '_') || 'cliente'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 1.5,
            letterRendering: true,
            logging: false,
            useCORS: true,
            allowTaint: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { mode: 'avoid-all' }
    };
    
    // Pequeno delay para renderização
    setTimeout(() => {
        html2pdf().set(opt).from(elementoPDF).save().then(() => {
            document.body.removeChild(elementoPDF);
            mostrarNotificacao('📄 PDF gerado com sucesso!', 'success');
            
            // LOG: PDF Gerado
            enviarLogDiscord('pdf', {
                id: os.id,
                numero: os.numero,
                cliente: os.cliente,
                tecnico: os.tecnico
            });
        }).catch(error => {
            console.error('Erro ao gerar PDF:', error);
            document.body.removeChild(elementoPDF);
            mostrarNotificacao('❌ Erro ao gerar PDF', 'error');
        });
    }, 300);
}

// ===== FILTROS E BUSCA =====
function configurarEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', function() {
        renderizarOS();
    });
    
    document.getElementById('filterStatus')?.addEventListener('change', function() {
        renderizarOS();
    });
    
    document.getElementById('filterTecnico')?.addEventListener('change', function() {
        renderizarOS();
    });
    
    document.getElementById('filterMonth')?.addEventListener('change', function() {
        renderizarOS();
    });
    
    document.getElementById('filterYear')?.addEventListener('change', function() {
        renderizarOS();
    });
    
    window.addEventListener('beforeunload', function() {
        salvarDados();
    });
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    renderizarOS();
}

// ===== MODAIS =====
function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.toggle('hidden');
        
        if (modal.classList.contains('hidden')) {
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
}

function criarModais() {
    // Modal de finalizar já está no HTML
    // Modal de exclusão já está no HTML
}

// ===== NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-left: 4px solid ${tipo === 'success' ? '#1a7a44' : tipo === 'error' ? '#dc2626' : tipo === 'warning' ? '#d97706' : '#2563eb'};
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    const icone = 
        tipo === 'success' ? 'fa-check-circle' : 
        tipo === 'error' ? 'fa-exclamation-circle' : 
        tipo === 'warning' ? 'fa-exclamation-triangle' : 
        'fa-info-circle';
    
    const cor = 
        tipo === 'success' ? '#1a7a44' : 
        tipo === 'error' ? '#dc2626' : 
        tipo === 'warning' ? '#d97706' : 
        '#2563eb';
    
    notificacao.innerHTML = `
        <i class="fas ${icone}" style="color: ${cor}; font-size: 1.25rem;"></i>
        <span style="flex: 1;">${mensagem}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #9ca3af; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notificacao.remove(), 300);
        }
    }, 5000);
}

// ===== EXPORTAÇÃO =====
function exportarBackup() {
    fazerBackup();
}

// ===== EXPORTAÇÃO PARA RELATÓRIOS =====
window.gerarRelatorio = function() {
    window.open('relatorios.html', '_blank');
};

// ===== ANIMAÇÕES =====
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    </style>
`);

// ===== EXPORTAÇÃO GLOBAL =====
window.toggleModal = toggleModal;
window.togglePassword = togglePassword;
window.logout = logout;
window.gerarPDF = gerarPDF;
window.alterarStatus = alterarStatus;
window.abrirModalExclusao = abrirModalExclusao;
window.clearSearch = clearSearch;
window.exportarBackup = exportarBackup;
window.gerarRelatorio = gerarRelatorio;