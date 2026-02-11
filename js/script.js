// ===== CONFIGURAÇÕES =====
const SENHA_HISTORICO = 'coop@2026'; // Senha para acessar o histórico

// ===== STATE MANAGEMENT =====
// TENTA CARREGAR DO LOCALSTORAGE, SE NÃO TIVER, CRIA ARRAY VAZIO
let ordens = [];

function carregarOrdens() {
    try {
        const dados = localStorage.getItem('tech_os_db');
        if (dados) {
            ordens = JSON.parse(dados);
            console.log('✅ OS carregadas do localStorage:', ordens.length);
        } else {
            ordens = [];
            console.log('📁 Nenhuma OS encontrada no localStorage');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar OS:', error);
        ordens = [];
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sistema iniciando...');
    carregarOrdens(); // CARREGA AS OS PRIMEIRO
    init();
    setupEventListeners();
    criarModalFinalizar();
});

function init() {
    renderOS();
    updateStats();
    console.log('✅ Sistema inicializado com', ordens.length, 'OS');
}

function setupEventListeners() {
    // Form submit
    document.getElementById('osForm').addEventListener('submit', handleFormSubmit);
    
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', renderOS);
    document.getElementById('filterStatus').addEventListener('change', renderOS);
    
    // Salvar antes de fechar (backup)
    window.addEventListener('beforeunload', function() {
        saveData();
    });
}

// ===== MODAL FUNCTIONS =====
function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.toggle('hidden');
        
        // Reset form when closing
        if (modal.classList.contains('hidden')) {
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
}

// ===== LOGIN HISTÓRICO =====
function openLoginModal() {
    toggleModal('modal-login');
}

function verificarSenhaHistorico() {
    const senhaInput = document.getElementById('historico-senha');
    const senha = senhaInput.value;
    
    if (senha === SENHA_HISTORICO) {
        toggleModal('modal-login');
        senhaInput.value = '';
        verHistoricoJSON();
    } else {
        alert('❌ Senha incorreta! Tente novamente.');
        senhaInput.value = '';
    }
}

// ===== FUNÇÕES DO HISTÓRICO JSON =====
function salvarJSONnoHistorico(os, jsonString) {
    let historicoJSON = JSON.parse(localStorage.getItem('historico_json_db')) || [];
    
    const fileName = `OS_${os.id.toString().slice(-6)}_${os.cliente.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}_${os.data.replace(/\//g, '-')}.json`;
    
    historicoJSON.push({
        id: os.id,
        numero_os: `#${os.id.toString().slice(-6)}`,
        cliente: os.cliente,
        equipamento: os.equipamento,
        tecnico: os.tecnico || 'Não atribuído',
        data_abertura: os.data,
        data_finalizacao: os.data_finalizacao || new Date().toLocaleDateString('pt-BR'),
        valor: os.valor_total || 0,
        json: jsonString,
        filename: fileName
    });
    
    localStorage.setItem('historico_json_db', JSON.stringify(historicoJSON));
}

function criarJSON(os) {
    return {
        metadados: {
            id: os.id,
            numero_os: `#${os.id.toString().slice(-6)}`,
            data_exportacao: new Date().toLocaleDateString('pt-BR'),
            hora_exportacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            versao: "1.0",
            sistema: "Cooperativa Unaí - Manutenção TI"
        },
        ordem_servico: {
            abertura: {
                data: os.data,
                hora: os.hora,
                tipo: os.tipo
            },
            finalizacao: {
                data: os.data_finalizacao || new Date().toLocaleDateString('pt-BR'),
                hora: os.hora_finalizacao || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                tecnico: os.tecnico || 'Não atribuído'
            }
        },
        cliente: {
            nome: os.cliente,
            telefone: os.telefone
        },
        equipamento: {
            descricao: os.equipamento,
            tipo_servico: os.tipo
        },
        servicos: {
            defeito_relatado: os.defeito,
            observacoes_iniciais: os.obs || 'Nenhuma observação',
            servicos_realizados: os.servicos_realizados || [],
            pecas_utilizadas: os.pecas_utilizadas || []
        },
        financeiro: {
            valor_total: os.valor_total || 0.00,
            status_pagamento: os.status_pagamento || 'Pendente'
        },
        status: os.status,
        historico: os.historico || [],
        observacoes_finais: os.obs_final || ''
    };
}

function baixarJSON(filename, jsonString) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function baixarJSONporId(id) {
    const historicoJSON = JSON.parse(localStorage.getItem('historico_json_db')) || [];
    const item = historicoJSON.find(i => i.id == id);
    
    if (item) {
        baixarJSON(item.filename, item.json);
        showNotification(`JSON baixado: ${item.numero_os}`, 'success');
    } else {
        showNotification('JSON não encontrado no histórico', 'error');
    }
}

function baixarTodosJSON() {
    const historicoJSON = JSON.parse(localStorage.getItem('historico_json_db')) || [];
    
    if (historicoJSON.length === 0) {
        showNotification('Nenhum JSON no histórico', 'info');
        return;
    }
    
    historicoJSON.forEach(item => {
        baixarJSON(item.filename, item.json);
    });
    
    showNotification(`${historicoJSON.length} arquivo(s) baixado(s)!`, 'success');
}

function verHistoricoJSON() {
    const historicoJSON = JSON.parse(localStorage.getItem('historico_json_db')) || [];
    
    if (historicoJSON.length === 0) {
        alert('📁 Nenhum JSON no histórico ainda.\n\nFinalize uma OS para gerar o JSON automaticamente.');
        return;
    }
    
    // Ordenar do mais recente para o mais antigo
    historicoJSON.sort((a, b) => b.id - a.id);
    
    let html = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2 class="modal-title">
                    <i class="fas fa-archive" style="color: #10b981;"></i> 
                    Histórico de OS Finalizadas
                </h2>
                <button onclick="toggleModal('modal-historico-json')" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="historico-container">
                <div class="historico-header">
                    <span class="historico-title">JSONs Salvos</span>
                    <span class="historico-stats">
                        <i class="fas fa-file-code"></i> ${historicoJSON.length} arquivo(s)
                    </span>
                </div>
                
                <div class="historico-list">
    `;
    
    historicoJSON.forEach(item => {
        html += `
            <div class="historico-item">
                <div class="historico-item-info">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <span style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">
                            ${item.numero_os}
                        </span>
                        <span style="font-weight: 600; color: #1f2937;">${item.cliente}</span>
                    </div>
                    <p style="display: flex; gap: 1rem; font-size: 0.75rem;">
                        <span><i class="fas fa-desktop"></i> ${item.equipamento}</span>
                        <span><i class="fas fa-user-cog"></i> ${item.tecnico}</span>
                        <span><i class="fas fa-calendar"></i> ${item.data_finalizacao}</span>
                        ${item.valor > 0 ? `<span><i class="fas fa-dollar-sign"></i> R$ ${item.valor.toFixed(2)}</span>` : ''}
                    </p>
                </div>
                <div class="historico-item-actions">
                    <button onclick="baixarJSONporId(${item.id})" class="btn-download">
                        <i class="fas fa-download"></i> JSON
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
                
                <div class="historico-footer">
                    <button onclick="baixarTodosJSON()" class="btn btn-success">
                        <i class="fas fa-file-archive"></i>
                        Baixar Todos os JSONs
                    </button>
                </div>
            </div>
        </div>
    `;
    
    let modal = document.getElementById('modal-historico-json');
    modal.innerHTML = html;
    modal.classList.remove('hidden');
}

// ===== CRIA MODAL DE FINALIZAÇÃO =====
function criarModalFinalizar() {
    // Verifica se o modal já existe e remove
    const modalExistente = document.getElementById('modal-finalizar');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'modal-finalizar';
    modal.className = 'modal hidden';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2 class="modal-title">
                    <i class="fas fa-check-circle" style="color: #10b981;"></i> 
                    Finalizar Ordem de Serviço
                </h2>
                <button type="button" onclick="toggleModal('modal-finalizar')" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form id="finalizarForm" class="modal-form">
                <input type="hidden" id="finalizar_os_id" name="os_id">
                
                <div class="form-group">
                    <label class="form-label">👨‍🔧 Técnico Responsável *</label>
                    <input type="text" name="tecnico" placeholder="Nome do técnico" required class="form-input">
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔧 Serviços Realizados *</label>
                    <textarea name="servicos_realizados" rows="3" placeholder="• Formatação do sistema&#10;• Troca de tela&#10;• Limpeza interna" required class="form-textarea"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">⚙️ Peças Utilizadas</label>
                    <textarea name="pecas_utilizadas" rows="2" placeholder="• Fonte 500w&#10;• Memória RAM 8GB&#10;• SSD 240GB" class="form-textarea"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">💰 Valor Total (R$)</label>
                    <input type="number" name="valor_total" step="0.01" min="0" placeholder="0.00" class="form-input">
                </div>
                
                <div class="form-group">
                    <label class="form-label">💳 Status de Pagamento</label>
                    <select name="status_pagamento" class="form-select">
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Parcial">Parcial</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">📝 Observações Finais</label>
                    <textarea name="obs_final" rows="2" placeholder="Equipamento entregue ao cliente, testado e aprovado..." class="form-textarea"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="toggleModal('modal-finalizar')" class="btn btn-outline">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-check-circle"></i>
                        Finalizar e Salvar JSON
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Adiciona event listener ao formulário
    const form = document.getElementById('finalizarForm');
    if (form) {
        // Remove listeners antigos
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.addEventListener('submit', handleFinalizarOS);
    }
}

// ===== HANDLE FINALIZAR OS =====
function handleFinalizarOS(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const osId = parseInt(formData.get('os_id'));
    const index = ordens.findIndex(o => o.id === osId);
    
    if (index !== -1) {
        // Atualiza os dados da OS
        ordens[index].status = 'Finalizado';
        ordens[index].data_finalizacao = new Date().toLocaleDateString('pt-BR');
        ordens[index].hora_finalizacao = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        ordens[index].tecnico = formData.get('tecnico');
        ordens[index].servicos_realizados = formData.get('servicos_realizados').split('\n').filter(s => s.trim() !== '');
        ordens[index].pecas_utilizadas = formData.get('pecas_utilizadas').split('\n').filter(p => p.trim() !== '');
        ordens[index].valor_total = parseFloat(formData.get('valor_total')) || 0;
        ordens[index].status_pagamento = formData.get('status_pagamento');
        ordens[index].obs_final = formData.get('obs_final');
        
        // Adiciona ao histórico da OS
        if (!ordens[index].historico) ordens[index].historico = [];
        ordens[index].historico.push({
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            acao: 'OS Finalizada',
            tecnico: formData.get('tecnico'),
            valor: ordens[index].valor_total
        });
        
        saveData(); // SALVA IMEDIATAMENTE
        
        // CRIA O JSON E SALVA NO HISTÓRICO VIRTUAL
        const os = ordens[index];
        const osData = criarJSON(os);
        const jsonString = JSON.stringify(osData, null, 2);
        salvarJSONnoHistorico(os, jsonString);
        
        // BAIXA O JSON
        const fileName = `OS_${os.id.toString().slice(-6)}_${os.cliente.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}_${os.data.replace(/\//g, '-')}.json`;
        baixarJSON(fileName, jsonString);
        
        // Fecha o modal
        toggleModal('modal-finalizar');
        
        showNotification('✅ OS finalizada! JSON salvo e baixado!', 'success');
        
        renderOS();
        updateStats();
    }
}

// ===== OS CRUD OPERATIONS =====
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // GERA UM ID ÚNICO GARANTIDO
    const id = Date.now() + Math.floor(Math.random() * 1000);
    
    const novaOS = {
        id: id,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        cliente: formData.get('cliente'),
        telefone: formData.get('telefone'),
        equipamento: formData.get('equipamento'),
        tipo: formData.get('tipo'),
        defeito: formData.get('defeito'),
        obs: formData.get('obs'),
        status: 'Aguardando',
        historico: [{
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            acao: 'OS Criada'
        }]
    };

    ordens.unshift(novaOS);
    saveData(); // SALVA IMEDIATAMENTE
    
    e.target.reset();
    toggleModal('modal-os');
    
    showNotification('✅ Ordem de serviço criada com sucesso!', 'success');
    
    renderOS();
    updateStats();
    
    console.log('✅ Nova OS criada e salva:', novaOS);
}

// ===== FUNÇÃO DE SALVAR REFORÇADA =====
function saveData() {
    try {
        localStorage.setItem('tech_os_db', JSON.stringify(ordens));
        console.log('💾 Dados salvos no localStorage:', ordens.length, 'OS');
        
        // VERIFICA SE SALVOU CORRETAMENTE
        const verificacao = localStorage.getItem('tech_os_db');
        if (verificacao) {
            console.log('✅ Verificação: dados salvos com sucesso');
        } else {
            console.error('❌ Falha na verificação do salvamento');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        showNotification('Erro ao salvar OS!', 'error');
    }
}

function updateStats() {
    document.getElementById('stat-pending').innerText = 
        ordens.filter(o => o.status === 'Aguardando').length;
    document.getElementById('stat-progress').innerText = 
        ordens.filter(o => o.status === 'Em Manutenção').length;
    document.getElementById('stat-done').innerText = 
        ordens.filter(o => o.status === 'Finalizado').length;
}

function changeStatus(id, newStatus) {
    const index = ordens.findIndex(o => o.id === id);
    if (index !== -1) {
        const oldStatus = ordens[index].status;
        
        // Se estiver mudando para "Finalizado", abre modal de finalização
        if (newStatus === 'Finalizado' && oldStatus !== 'Finalizado') {
            openFinalizarModal(id);
            return;
        }
        
        ordens[index].status = newStatus;
        
        // Adiciona ao histórico
        if (!ordens[index].historico) ordens[index].historico = [];
        ordens[index].historico.push({
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            acao: `Status alterado: ${oldStatus} → ${newStatus}`
        });
        
        saveData(); // SALVA IMEDIATAMENTE
        
        renderOS();
        updateStats();
        
        showNotification(`Status alterado para "${newStatus}"`, 'info');
    }
}

function openFinalizarModal(id) {
    // Garante que o modal existe
    criarModalFinalizar();
    
    const modal = document.getElementById('modal-finalizar');
    const input = document.getElementById('finalizar_os_id');
    
    if (modal && input) {
        input.value = id;
        modal.classList.remove('hidden');
    }
}

function deleteOS(id) {
    if (confirm('⚠️ Deseja realmente excluir esta Ordem de Serviço?')) {
        ordens = ordens.filter(o => o.id !== id);
        saveData(); // SALVA IMEDIATAMENTE
        renderOS();
        updateStats();
        showNotification('🗑️ Ordem de serviço excluída!', 'success');
    }
}

// ===== PRINT FUNCTION =====
function printOS(id) {
    const os = ordens.find(o => o.id === id);
    const printArea = document.getElementById('print-area');
    
    printArea.innerHTML = `
        <div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
            <div style="border: 2px solid #10b981; padding: 2rem; border-radius: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #10b981; padding-bottom: 1rem;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 800; color: #10b981;">COOP UNAÍ</h1>
                        <p style="color: #6b7280;">Manutenção de TI</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-weight: bold;">OS #${os.id.toString().slice(-6)}</p>
                        <p style="color: #6b7280;">${os.data} às ${os.hora}</p>
                        ${os.data_finalizacao ? `<p style="color: #10b981; font-size: 0.875rem;">Finalizado: ${os.data_finalizacao}</p>` : ''}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">DADOS DO CLIENTE</h3>
                        <p><strong>Nome:</strong> ${os.cliente}</p>
                        <p><strong>Telefone:</strong> ${os.telefone}</p>
                    </div>
                    <div>
                        <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">EQUIPAMENTO</h3>
                        <p>${os.equipamento}</p>
                        <p style="color: #6b7280; margin-top: 0.5rem;">Tipo: ${os.tipo}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">DEFEITO RELATADO</h3>
                    <p style="background: #ecfdf5; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #10b981;">
                        ${os.defeito}
                    </p>
                </div>
                
                ${os.servicos_realizados ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">SERVIÇOS REALIZADOS</h3>
                    <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
                        ${Array.isArray(os.servicos_realizados) ? os.servicos_realizados.map(s => `<p>• ${s}</p>`).join('') : `<p>${os.servicos_realizados}</p>`}
                    </div>
                </div>
                ` : ''}
                
                ${os.pecas_utilizadas && os.pecas_utilizadas.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">PEÇAS UTILIZADAS</h3>
                    <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem;">
                        ${Array.isArray(os.pecas_utilizadas) ? os.pecas_utilizadas.map(p => `<p>• ${p}</p>`).join('') : `<p>${os.pecas_utilizadas}</p>`}
                    </div>
                </div>
                ` : ''}
                
                ${os.tecnico ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">TÉCNICO RESPONSÁVEL</h3>
                    <p><strong>${os.tecnico}</strong></p>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 3rem;">
                    <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">OBSERVAÇÕES</h3>
                    <p style="color: #6b7280;">${os.obs || 'Nenhuma observação adicional.'}</p>
                    ${os.obs_final ? `<p style="color: #6b7280; margin-top: 0.5rem;"><strong>Obs. Final:</strong> ${os.obs_final}</p>` : ''}
                </div>
                
                ${os.valor_total ? `
                <div style="margin-bottom: 2rem; text-align: right; padding: 1rem; background: #ecfdf5; border-radius: 0.5rem;">
                    <h3 style="font-weight: 700; color: #10b981; font-size: 1.25rem;">VALOR TOTAL: R$ ${os.valor_total.toFixed(2)}</h3>
                    <p style="color: #6b7280; font-size: 0.875rem;">Status: ${os.status_pagamento || 'Pendente'}</p>
                </div>
                ` : ''}
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 4rem;">
                    <div style="border-top: 2px solid #000; padding-top: 0.5rem; text-align: center;">
                        Assinatura do Técnico
                    </div>
                    <div style="border-top: 2px solid #000; padding-top: 0.5rem; text-align: center;">
                        Assinatura do Cliente
                    </div>
                </div>
                
                <div style="margin-top: 2rem; text-align: center; color: #9ca3af; font-size: 0.75rem;">
                    <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>
        </div>
    `;
    
    window.print();
}

// ===== RENDER FUNCTIONS =====
function renderOS() {
    const list = document.getElementById('os-list');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterStatus').value;

    const filtered = ordens.filter(os => {
        const matchSearch = os.cliente.toLowerCase().includes(search) || 
                           os.equipamento.toLowerCase().includes(search);
        const matchFilter = filter === 'all' || os.status === filter;
        return matchSearch && matchFilter;
    });

    if (filtered.length === 0) {
        list.innerHTML = `
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

    list.innerHTML = filtered.map(os => createOSCard(os)).join('');
}

function createOSCard(os) {
    const statusClass = {
        'Aguardando': 'status-aguardando',
        'Em Manutenção': 'status-em-manutencao',
        'Finalizado': 'status-finalizado'
    }[os.status] || 'status-aguardando';

    return `
        <div class="os-card">
            <div class="os-card-content">
                <div class="os-header">
                    <div>
                        <span class="os-id">#${os.id.toString().slice(-6)}</span>
                        <h4 class="os-client">
                            <i class="fas fa-user mr-2" style="color: #10b981;"></i>
                            ${os.cliente}
                        </h4>
                        <p class="os-equipment">
                            <i class="fas fa-desktop"></i>
                            ${os.equipamento}
                        </p>
                        ${os.tecnico ? `<p class="os-equipment" style="margin-top: 0.25rem;"><i class="fas fa-user-cog"></i> Técnico: ${os.tecnico}</p>` : ''}
                    </div>
                    <span class="os-status ${statusClass}">
                        ${os.status}
                    </span>
                </div>
                
                <div class="os-defect">
                    "${os.defeito.substring(0, 120)}${os.defeito.length > 120 ? '...' : ''}"
                </div>

                <div class="os-footer">
                    <div class="os-actions">
                        <button onclick="printOS(${os.id})" class="os-action-btn" title="Imprimir">
                            <i class="fas fa-print"></i>
                        </button>
                        ${os.status === 'Finalizado' ? `
                        <button onclick="baixarJSONporId(${os.id})" class="os-action-btn" title="Baixar JSON" style="color: #10b981;">
                            <i class="fas fa-file-code"></i>
                        </button>
                        ` : ''}
                        <button onclick="deleteOS(${os.id})" class="os-action-btn" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <select onchange="changeStatus(${os.id}, this.value)" class="os-status-select" ${os.status === 'Finalizado' ? 'disabled' : ''}>
                            <option value="Aguardando" ${os.status === 'Aguardando' ? 'selected' : ''}>Aguardando</option>
                            <option value="Em Manutenção" ${os.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
                            <option value="Finalizado" ${os.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                        </select>
                        <span class="os-date">
                            <i class="far fa-calendar-alt"></i> ${os.data}
                        </span>
                    </div>
                </div>
                
                ${os.data_finalizacao ? `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed #e5e7eb; font-size: 0.75rem; color: #10b981;">
                    <i class="fas fa-check-circle"></i> Finalizado em ${os.data_finalizacao} às ${os.hora_finalizacao}
                    ${os.tecnico ? `por ${os.tecnico}` : ''}
                    ${os.valor_total ? ` | R$ ${os.valor_total.toFixed(2)}` : ''}
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) oldNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;

    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    const color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';

    notification.innerHTML = `
        <i class="fas ${icon}" style="color: ${color};"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 300);
    }, 3000);
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.toggleModal = toggleModal;
window.openLoginModal = openLoginModal;
window.verificarSenhaHistorico = verificarSenhaHistorico;
window.changeStatus = changeStatus;
window.deleteOS = deleteOS;
window.printOS = printOS;
window.baixarJSONporId = baixarJSONporId;
window.baixarTodosJSON = baixarTodosJSON;
window.verHistoricoJSON = verHistoricoJSON;
window.openFinalizarModal = openFinalizarModal;
window.criarModalFinalizar = criarModalFinalizar;
