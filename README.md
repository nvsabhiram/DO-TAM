# 🚀 Web App Deployment on DigitalOcean Kubernetes

This repository contains a simple static web application containerized using Docker and deployed to a Kubernetes cluster on **DigitalOcean (DOKS)**.

The deployment includes:

- ✅ Docker-based containerization
- ✅ Kubernetes deployment and service manifests
- ✅ LoadBalancer to expose the app publicly
- ✅ Cluster autoscaling configured during cluster creation (min 2, max 3 nodes)

---

## 📁 Project Structure

```
.
├── index.html           # Static webpage
├── Dockerfile           # Docker build instructions
├── deployment.yaml      # Kubernetes Deployment manifest
├── service.yaml         # Kubernetes LoadBalancer Service manifest
```

---

## 🧰 Prerequisites

- A [DigitalOcean](https://www.digitalocean.com/) account
- [Docker](https://www.docker.com/products/docker-desktop)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [doctl CLI](https://docs.digitalocean.com/reference/doctl/) (authenticated with your DO account)
- [Docker Hub](https://hub.docker.com/) account

---

## 📦 Step-by-Step Deployment Guide

### 1. Clone the Repository

```bash
git clone https://github.com/mantoniazzz/DO_Test_Web_App.git
cd <your-repo-name>
```

---

### 2. Build & Push the Docker Image

Replace `<your-dockerhub-username>` with your Docker Hub username.

```bash
# Build image
docker build -t <your-dockerhub-username>/tech-intro-page .

# Login to Docker Hub
docker login

# Push image
docker push <your-dockerhub-username>/tech-intro-page
```

---

### 3. Create Kubernetes Cluster on DigitalOcean

Use the DigitalOcean UI or `doctl` to create the cluster with autoscaling:

```bash
doctl kubernetes cluster create web-app-cluster \
  --region <region> \
  --version <k8s-version> \
  --min-nodes 2 \
  --max-nodes 3 \
  --count 2 \
  --enable-autoscaling
```

Save kubeconfig:

```bash
doctl kubernetes cluster kubeconfig save tech-intro-page-cluster
```

Verify cluster access:

```bash
kubectl get nodes
```

---

### 4. Deploy the Application to Kubernetes

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

Get external IP:
 From Loadbalancer

---

## ✅ Summary

| Feature            | Description                               |
|--------------------|-------------------------------------------|
| Containerization   | Docker (with NGINX serving static HTML)   |
| Cluster Platform   | DigitalOcean Kubernetes                   |
| Autoscaling        | Configured at cluster launch (2–3 nodes)  |
| Load Balancing     | Service type: LoadBalancer                |
| Deployment         | Via `kubectl apply` using YAML manifests |

---

## 🧹 Cleanup

```bash
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
doctl kubernetes cluster delete web-app-cluster
```

---
