// ===== STATE MANAGEMENT =====
let ordens = JSON.parse(localStorage.getItem('tech_os_db')) || [];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupEventListeners();
});

function init() {
    renderOS();
    updateStats();
}

function setupEventListeners() {
    // Form submit
    document.getElementById('osForm').addEventListener('submit', handleFormSubmit);
    
    // Search and filter
    document.getElementById('searchInput').addEventListener('input', renderOS);
    document.getElementById('filterStatus').addEventListener('change', renderOS);
}

// ===== MODAL FUNCTIONS =====
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.classList.toggle('hidden');
    
    // Reset form when closing
    if (modal.classList.contains('hidden')) {
        document.getElementById('osForm').reset();
    }
}

// ===== OS CRUD OPERATIONS =====
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const novaOS = {
        id: Date.now(),
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
        historico: []
    };

    ordens.unshift(novaOS);
    saveData();
    
    e.target.reset();
    toggleModal('modal-os');
    
    showNotification('Ordem de serviço criada com sucesso!', 'success');
    
    renderOS();
    updateStats();
}

function saveData() {
    localStorage.setItem('tech_os_db', JSON.stringify(ordens));
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
        ordens[index].status = newStatus;
        saveData();
        
        renderOS();
        updateStats();
        
        showNotification(`Status alterado de "${oldStatus}" para "${newStatus}"`, 'info');
    }
}

function deleteOS(id) {
    if (confirm('Deseja realmente excluir esta Ordem de Serviço?')) {
        ordens = ordens.filter(o => o.id !== id);
        saveData();
        
        renderOS();
        updateStats();
        
        showNotification('Ordem de serviço excluída com sucesso!', 'success');
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
                
                <div style="margin-bottom: 3rem;">
                    <h3 style="font-weight: 700; border-bottom: 1px solid #10b981; padding-bottom: 0.5rem; margin-bottom: 1rem;">OBSERVAÇÕES TÉCNICAS</h3>
                    <p style="color: #6b7280;">${os.obs || 'Nenhuma observação adicional.'}</p>
                </div>
                
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
            <div class="col-span-full text-center py-12">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <p style="color: #6b7280; font-size: 1.125rem;">Nenhuma ordem de serviço encontrada</p>
                <button onclick="toggleModal('modal-os')" class="btn btn-primary" style="margin-top: 1rem;">
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
                        <button onclick="deleteOS(${os.id})" class="os-action-btn" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <select onchange="changeStatus(${os.id}, this.value)" class="os-status-select">
                            <option value="Aguardando" ${os.status === 'Aguardando' ? 'selected' : ''}>Aguardando</option>
                            <option value="Em Manutenção" ${os.status === 'Em Manutenção' ? 'selected' : ''}>Em Manutenção</option>
                            <option value="Finalizado" ${os.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                        </select>
                        <span class="os-date">
                            <i class="far fa-calendar-alt"></i> ${os.data}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-left: 4px solid ${type === 'success' ? '#10b981' : '#3b82f6'};
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    const color = type === 'success' ? '#10b981' : '#3b82f6';

    notification.innerHTML = `
        <i class="fas ${icon}" style="color: ${color};"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.toggleModal = toggleModal;
window.changeStatus = changeStatus;
window.delete