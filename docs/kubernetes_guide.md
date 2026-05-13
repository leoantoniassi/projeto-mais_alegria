# ☸️ Kubernetes no Projeto Mais Alegria

## O que é Kubernetes?

**Kubernetes (K8s)** é um **orquestrador de containers**. Enquanto o Docker e o Docker Compose apenas criam e rodam containers, o Kubernetes gerencia **como, onde e quantas cópias** desses containers rodam — com auto-recuperação, escalonamento automático e atualizações sem downtime.

### Analogia prática

| Conceito | Docker Compose | Kubernetes |
|---|---|---|
| Papel | Roda containers localmente | Orquestra containers em produção |
| Escala | Manual (1 instância por serviço) | Automática (N réplicas) |
| Falha | Container cai, para | Pod reinicia automaticamente |
| Atualização | Para tudo, recria | Rolling update sem downtime |

---

## Arquitetura do Kubernetes

```
┌─────────────────────────────────────────────────────────────┐
│                        CLUSTER K8s                          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   Control Plane  │    │          Worker Node(s)       │   │
│  │  (cérebro)       │    │                              │   │
│  │                  │    │  ┌─────────┐  ┌─────────┐   │   │
│  │  - API Server    │───▶│  │   Pod   │  │   Pod   │   │   │
│  │  - Scheduler     │    │  │ (app)   │  │ (app)   │   │   │
│  │  - etcd          │    │  └─────────┘  └─────────┘   │   │
│  │  - Controller    │    │                              │   │
│  └─────────────────┘    └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Objetos Fundamentais do K8s

### 🟦 Pod
A **menor unidade** do K8s. Contém um ou mais containers que compartilham rede e storage.
- Equivale a um **container** no Docker
- Efêmero — se morrer, o K8s recria um novo
- Nunca se cria pods diretamente em produção

### 🟩 Deployment
Gerencia **quantas réplicas** de um Pod rodam e garante que estejam sempre no ar.
- Equivale ao `service: backend` no docker-compose
- Faz **rolling updates** (atualiza sem derrubar tudo)
- Define a **estratégia de restart**

### 🟨 Service
Expõe os Pods para a rede — dentro do cluster ou para o mundo externo.
- Equivale ao `ports:` no docker-compose
- Tipos: `ClusterIP` (interno), `NodePort` (externo dev), `LoadBalancer` (produção cloud)

### 🟧 ConfigMap
Armazena **configurações não-sensíveis** como variáveis de ambiente.
- Equivale às variáveis `environment:` não-secretas no docker-compose

### 🔴 Secret
Armazena **dados sensíveis** (senhas, tokens) de forma criptografada.
- Equivale às variáveis `environment:` com senhas no docker-compose

### 🟪 PersistentVolumeClaim (PVC)
Solicita **armazenamento persistente** para os Pods (banco de dados, uploads).
- Equivale ao `volumes:` no docker-compose

### 🟫 Namespace
**Isolamento lógico** dentro do cluster. Separa ambientes (dev, staging, prod).

---

## Mapeamento: Docker Compose → Kubernetes

```
docker-compose.yml                  kubernetes/
├── service: db           →         ├── postgres/
│   ├── image             →         │   ├── statefulset.yaml
│   ├── environment       →         │   ├── service.yaml
│   ├── volumes (SQL)     →         │   ├── configmap.yaml   ← scripts SQL
│   └── healthcheck       →         │   ├── secret.yaml
├── service: backend      →         │   ├── secret.example.yaml
│   ├── build             →         │   └── pvc.yaml
│   ├── environment       →         ├── backend/
│   └── volumes (uploads) →         │   ├── deployment.yaml
└── service: frontend     →         │   ├── service.yaml
    ├── build             →         │   ├── configmap.yaml
    └── ports             →         │   ├── secret.yaml
                                    │   ├── secret.example.yaml
                                    │   └── pvc.yaml         ← uploads
                                    └── frontend/
                                        ├── deployment.yaml
                                        └── service.yaml
```

### Arquivos criados no projeto

| Arquivo | Descrição |
|---|---|
| [namespace.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/namespace.yaml) | Namespace `mais-alegria` |
| [postgres/configmap.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/postgres/configmap.yaml) | Scripts `init.sql` e `seed.sql` para inicializar o banco |
| [postgres/secret.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/postgres/secret.yaml) | Credenciais do banco (base64) — **não commitado no Git** |
| [postgres/secret.example.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/postgres/secret.example.yaml) | Template do secret (sem dados reais) — commitado como referência |
| [postgres/pvc.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/postgres/pvc.yaml) | Volume persistente de 1GB para dados do banco |
| [postgres/statefulset.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/postgres/statefulset.yaml) | Pod do PostgreSQL com healthcheck e scripts SQL montados |
| [postgres/service.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/postgres/service.yaml) | Serviço interno ClusterIP |
| [backend/configmap.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/backend/configmap.yaml) | Variáveis não-sensíveis |
| [backend/secret.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/backend/secret.yaml) | JWT Secret — **não commitado no Git** |
| [backend/secret.example.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/backend/secret.example.yaml) | Template do secret (sem dados reais) — commitado como referência |
| [backend/pvc.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/backend/pvc.yaml) | Volume persistente de 1GB para uploads dos usuários |
| [backend/deployment.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/backend/deployment.yaml) | 2 réplicas + rolling update + uploads persistentes |
| [backend/service.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/backend/service.yaml) | Serviço interno ClusterIP |
| [frontend/deployment.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/frontend/deployment.yaml) | 2 réplicas do Nginx/React |
| [frontend/service.yaml](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/frontend/service.yaml) | Serviço NodePort (acesso externo) |
| [deploy.ps1](file:///c:/Users/franc/OneDrive/%C3%81rea%20de%20Trabalho/vero/Fatec/pi-mais-alegria/projeto-mais-alegria/projeto-mais_alegria/k8s/deploy.ps1) | Script PowerShell de automação |

> **⚠️ Sobre os Secrets:** Os arquivos `secret.yaml` estão no `.gitignore` e **não são commitados**.
> Para um novo membro da equipe criar os secrets localmente:
> ```powershell
> # Copie o template e preencha com os valores reais
> Copy-Item k8s\postgres\secret.example.yaml k8s\postgres\secret.yaml
> Copy-Item k8s\backend\secret.example.yaml  k8s\backend\secret.yaml
> # Edite os arquivos e substitua os placeholders pelos valores base64
> ```

---

## Pre-requisitos

> **Antes de comecar, voce precisa ter instalado:**
> - Docker Desktop (rodando)
> - kubectl
> - Minikube

### 1. Instalar kubectl

```powershell
winget install Kubernetes.kubectl

# Verificar
kubectl version --client
# Client Version: v1.30.x
```

### 2. Instalar Minikube

```powershell
winget install Kubernetes.minikube

# Verificar
minikube version
```

---

## Rodando o Projeto com Kubernetes (Passo a Passo Completo)

### PASSO 1 — Garantir que o Docker Desktop esta rodando

Abra o Docker Desktop e aguarde o icone ficar verde (Engine running).

```powershell
# Confirmar que o Docker esta OK
docker info
```

---

### PASSO 2 — Iniciar o Minikube

```powershell
# Inicia um cluster K8s local usando o Docker como driver
minikube start --driver=docker

# Resultado esperado:
# * minikube v1.32.x on Windows
# * Using the docker driver based on user configuration
# * Starting control plane node minikube in cluster minikube
# * Done! kubectl is now configured to use "minikube" cluster
```

Verificar se o no esta pronto:
```powershell
kubectl get nodes

# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   1m    v1.30.x
```

---

### PASSO 3 — Apontar o Docker para o Minikube

> **Por que?** O Minikube tem seu proprio daemon Docker interno. Ao apontar o Docker para ele, as imagens que voce builda ficam acessiveis diretamente pelo cluster — sem precisar de Docker Hub.

```powershell
# Execute este comando na raiz do projeto
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Confirmar que funcionou (voce vera as imagens internas do minikube):
docker images
```

> **ATENCAO:** Este comando precisa ser re-executado **em cada nova sessao do PowerShell**.

---

### PASSO 4 — Buildar as imagens Docker

```powershell
# Na raiz do projeto (projeto-mais_alegria/)
docker build -t mais-alegria/backend:latest .\backend
docker build -t mais-alegria/frontend:latest .\frontend

# Verificar se as imagens foram criadas:
docker images | Select-String "mais-alegria"
# mais-alegria/backend    latest    ...
# mais-alegria/frontend   latest    ...
```

---

### PASSO 5 — Aplicar os manifests no Kubernetes

```powershell
# 1. Criar o namespace
kubectl apply -f k8s\namespace.yaml

# 2. Banco de dados (sempre primeiro — backend depende dele)
kubectl apply -f k8s\postgres

# 3. Backend
kubectl apply -f k8s\backend

# 4. Frontend
kubectl apply -f k8s\frontend
```

Aguardar todos os pods ficarem prontos:
```powershell
kubectl get pods -n mais-alegria --watch

# Aguarde todos mostrarem STATUS = Running e READY = 1/1 (ou 2/2):
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-xxxxxxxxx-xxxxx     1/1     Running   0          2m
# backend-xxxxxxxxx-yyyyy     1/1     Running   0          2m
# frontend-xxxxxxxxx-xxxxx    1/1     Running   0          1m
# frontend-xxxxxxxxx-yyyyy    1/1     Running   0          1m
# postgres-0                  1/1     Running   0          3m
#
# Pressione Ctrl+C para sair do modo watch
```

---

### PASSO 6 — Acessar a aplicacao

**Opcao A — Via Minikube (recomendado, abre no navegador automaticamente):**
```powershell
minikube service frontend-service -n mais-alegria

# O Minikube abre automaticamente o navegador com a URL correta.
# Exemplo de URL: http://127.0.0.1:XXXXX
```

**Opcao B — Via port-forward (URL fixa em localhost:8080):**
```powershell
kubectl port-forward service/frontend-service 8080:80 -n mais-alegria

# Acesse: http://localhost:8080
# Mantenha o terminal aberto enquanto usar a aplicacao.
# Pressione Ctrl+C para encerrar.
```

**Opcao C — Apenas obter a URL sem abrir o navegador:**
```powershell
minikube service frontend-service -n mais-alegria --url
# http://127.0.0.1:XXXXX
```

---

### PASSO 7 — Verificar os logs (quando algo der errado)

```powershell
# Ver logs do backend em tempo real
kubectl logs -l app=backend -n mais-alegria --follow

# Ver logs do PostgreSQL
kubectl logs -l app=postgres -n mais-alegria --follow

# Ver logs do frontend (Nginx)
kubectl logs -l app=frontend -n mais-alegria --follow

# Descricao detalhada de um pod (util para CrashLoopBackOff)
kubectl describe pod <nome-do-pod> -n mais-alegria
# (use kubectl get pods -n mais-alegria para ver o nome)
```

---

### Alternativa: Script de Deploy Automatico

O projeto tem um script PowerShell que faz os passos 1 a 6 automaticamente:

```powershell
# Deploy completo (faz tudo: minikube check, build, apply, abre no navegador)
.\k8s\deploy.ps1 -Action deploy

# Ver status de todos os recursos
.\k8s\deploy.ps1 -Action status

# Ver logs de um servico especifico
.\k8s\deploy.ps1 -Action logs -Service backend
.\k8s\deploy.ps1 -Action logs -Service postgres
.\k8s\deploy.ps1 -Action logs -Service frontend

# Remover tudo do cluster
.\k8s\deploy.ps1 -Action teardown
```

---

## Fluxo para Atualizar o Codigo

Sempre que voce alterar o codigo do backend ou frontend:

```powershell
# 1. Apontar Docker para o Minikube (se for uma nova sessao do terminal)
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# 2. Rebuildar apenas a imagem que mudou
docker build -t mais-alegria/backend:latest .\backend
# ou
docker build -t mais-alegria/frontend:latest .\frontend

# 3. Forcar o K8s a recriar os pods com a nova imagem
kubectl rollout restart deployment/backend -n mais-alegria
# ou
kubectl rollout restart deployment/frontend -n mais-alegria

# 4. Acompanhar o rolling update
kubectl rollout status deployment/backend -n mais-alegria
# Waiting for deployment "backend" rollout to finish: 1 out of 2 new replicas...
# deployment "backend" successfully rolled out
```

---

## Parar e Retomar o Ambiente

```powershell
# Pausar o Minikube (para nao consumir recursos)
minikube pause

# Retomar
minikube unpause

# Desligar o Minikube completamente
minikube stop

# Religar
minikube start

# Abrir o Dashboard visual do Kubernetes no navegador
minikube dashboard
```

---

## Solucao de Problemas Comuns

| Sintoma | Causa provavel | Solucao |
|---|---|---|
| `ImagePullBackOff` | Imagem nao encontrada no registry | Rode os passos 3 e 4 novamente (apontar Docker + rebuildar) |
| `CrashLoopBackOff` no backend | Backend nao consegue conectar ao Postgres | Verifique se o Postgres esta Running: `kubectl get pods -n mais-alegria` |
| `Pending` no pod | Recursos insuficientes no Minikube | Aumente os recursos: `minikube start --memory=4096 --cpus=2` |
| `Minikube not running` | Minikube foi desligado | `minikube start --driver=docker` |
| `connection refused` no port-forward | Port-forward nao esta rodando | Re-execute `kubectl port-forward service/frontend-service 8080:80 -n mais-alegria` |
| Banco vazio / tabelas nao criadas | PVC ja existia de um deploy anterior | `kubectl delete pvc postgres-pvc -n mais-alegria` e re-aplique o postgres |

---

## Comandos Essenciais

```powershell
# Listar todos os recursos
kubectl get all -n mais-alegria

# Ver pods com detalhes
kubectl get pods -n mais-alegria -o wide

# Entrar dentro de um pod (como docker exec)
kubectl exec -it <nome-pod> -n mais-alegria -- sh

# Ver logs
kubectl logs <nome-pod> -n mais-alegria

# Aplicar mudanças
kubectl apply -f k8s/

# Deletar tudo
kubectl delete -f k8s/

# Dashboard visual
minikube dashboard
```

---

## Diferenças Chave: Dev vs. Produção

| Aspecto | Minikube (Dev) | Cloud (Prod) |
|---|---|---|
| Cluster | Local, 1 nó | Multi-nó (GKE, EKS, AKS) |
| Registry | Docker local | Docker Hub, GCR, ECR |
| Service tipo | `NodePort` | `LoadBalancer` |
| SSL/HTTPS | Manual | Cert-Manager automático |
| Storage | `hostPath` | PersistentDisk, EFS |
| Secrets | YAML (base64) | Vault, AWS Secrets Manager |

---

## Resumo do Fluxo

```
1. Escreve código
      ↓
2. docker build → imagem Docker
      ↓
3. Push para registry (Docker Hub / ECR / etc.)
      ↓
4. Atualiza o deployment.yaml (nova tag da imagem)
      ↓
5. kubectl apply → K8s faz rolling update
      ↓
6. App atualizado sem downtime ✅
```
