# =============================================================
# Script de Deploy - Kubernetes - Projeto Mais Alegria
# Executar no PowerShell com Docker e Minikube instalados
# Uso: .\deploy.ps1 -Action [deploy|teardown|status|logs] -Service [all|postgres|backend|frontend]
# =============================================================

param(
    [string]$Action = "deploy",   # deploy | teardown | status | logs
    [string]$Service = "all"      # all | postgres | backend | frontend
)

$Namespace = "mais-alegria"
$K8sDir = "$PSScriptRoot"
$RootDir = Split-Path $K8sDir -Parent

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Wait-ForPods {
    param([string]$Label)
    Write-Host "  Aguardando pods '$Label' ficarem prontos..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod -l app=$Label -n $Namespace --timeout=120s
}

# ---------------------------------------------------------------
# DEPLOY
# ---------------------------------------------------------------
if ($Action -eq "deploy") {
    Write-Header "Iniciando Deploy no Kubernetes"

    # 1. Verificar se Minikube esta rodando
    Write-Host ""
    Write-Host "[1/6] Verificando Minikube..." -ForegroundColor Green
    $minikubeOut = minikube status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Minikube nao esta rodando. Iniciando..." -ForegroundColor Yellow
        minikube start --driver=docker
    } else {
        Write-Host "  Minikube OK" -ForegroundColor Green
    }

    # 2. Apontar Docker para o Minikube
    Write-Host ""
    Write-Host "[2/6] Configurando Docker para Minikube..." -ForegroundColor Green
    & minikube -p minikube docker-env --shell powershell | Invoke-Expression

    # 3. Build das imagens
    Write-Host ""
    Write-Host "[3/6] Buildando imagens Docker..." -ForegroundColor Green
    docker build -t mais-alegria/backend:latest "$RootDir\backend"
    docker build -t mais-alegria/frontend:latest "$RootDir\frontend"
    Write-Host "  Imagens buildadas com sucesso." -ForegroundColor Green

    # 4. Criar namespace
    Write-Host ""
    Write-Host "[4/6] Criando namespace '$Namespace'..." -ForegroundColor Green
    kubectl apply -f "$K8sDir\namespace.yaml"

    # 5. Aplicar manifests
    Write-Host ""
    Write-Host "[5/6] Aplicando manifests Kubernetes..." -ForegroundColor Green

    Write-Host "  -> PostgreSQL..." -ForegroundColor White
    kubectl apply -f "$K8sDir\postgres"
    Wait-ForPods "postgres"

    Write-Host "  -> Backend..." -ForegroundColor White
    kubectl apply -f "$K8sDir\backend"
    Wait-ForPods "backend"

    Write-Host "  -> Frontend..." -ForegroundColor White
    kubectl apply -f "$K8sDir\frontend"
    Wait-ForPods "frontend"

    # 6. Mostrar status e URL
    Write-Header "Deploy Concluido!"
    kubectl get all -n $Namespace

    Write-Host ""
    Write-Host "[6/6] Obtendo URL da aplicacao..." -ForegroundColor Green
    $url = minikube service frontend-service -n $Namespace --url
    Write-Host ""
    Write-Host "  Aplicacao disponivel em: $url" -ForegroundColor Cyan
    Write-Host "  Abrindo no navegador..." -ForegroundColor Green
    Start-Process $url
}

# ---------------------------------------------------------------
# TEARDOWN
# ---------------------------------------------------------------
elseif ($Action -eq "teardown") {
    Write-Header "Removendo todos os recursos do K8s"
    kubectl delete namespace $Namespace
    Write-Host "  Namespace '$Namespace' removido." -ForegroundColor Yellow
}

# ---------------------------------------------------------------
# STATUS
# ---------------------------------------------------------------
elseif ($Action -eq "status") {
    Write-Header "Status dos Recursos"
    kubectl get all -n $Namespace
    Write-Host ""
    kubectl get pvc -n $Namespace
}

# ---------------------------------------------------------------
# LOGS
# ---------------------------------------------------------------
elseif ($Action -eq "logs") {
    Write-Header "Logs do servico: $Service"
    kubectl logs -l app=$Service -n $Namespace --follow --tail=50
}

else {
    Write-Host "Uso: .\deploy.ps1 -Action [deploy|teardown|status|logs] -Service [all|postgres|backend|frontend]"
}
