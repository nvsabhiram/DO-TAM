# Setup Guide: Scalable Static Web App on DigitalOcean Kubernetes (DOKS)

## Table of Contents
- [Deployment Flow Diagram](#deployment-flow-diagram)
- [Pre-requisites](#pre-requisites)
- [Step 1: Clone and Build Docker Image](#step-1-clone-and-build-docker-image)
- [Connect DO Registry to DOKS](#connect-do-registry-to-doks)
- [Step 2: Create a DOKS Cluster](#step-2-create-a-doks-cluster)
- [Step 3: Connect to the Cluster](#step-3-connect-to-the-cluster)
- [Step 4: Create Namespace and Deploy App](#step-4-create-namespace-and-deploy-app)
- [Step 5: Install Metrics Server](#step-5-install-metrics-server)
- [Step 6: Enable HPA](#step-6-enable-hpa)
- [Step 7 (Optional): Use DO Spaces and CDN](#step-7-optional-use-do-spaces-and-cdn)
- [Cost and Performance Summary](#cost-and-performance-summary)

---

## Deployment Flow Diagram

```
Developer
↓
Docker Image Build and Push (DigitalOcean Registry)
↓
DOKS Cluster (Deployment via YAML)
↓
Kubernetes Deployment → Pod(s) running NGINX
↓
Horizontal Pod Autoscaler (scales pods based on CPU)
↓
Kubernetes Service (LoadBalancer)
↓
User accesses via EXTERNAL-IP (LoadBalancer)
```

---

## Pre-requisites

- DigitalOcean Account
- DigitalOcean Kubernetes (DOKS) cluster (2-node minimum)
- [doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) installed and authenticated
- Docker installed and configured
- DigitalOcean Container Registry (DOCR) created

---

## Step 1: Clone and Build Docker Image

```bash
git clone https://github.com/nvsabhiram/DO-TAM.git
cd DO-TAM/webapp
doctl auth init
doctl registry login
docker build -t myapp .
docker tag myapp registry.digitalocean.com/<your-registry-name>/myapp:1.0
docker push registry.digitalocean.com/<your-registry-name>/myapp:1.0
```

---

## Connect DO Registry to DOKS
Visit the [registry page](https://cloud.digitalocean.com/registry) and click the Settings tab. In the DigitalOcean Kubernetes integration section, click Edit to display the available Kubernetes clusters. Select the clusters you wish to add and click Save.
In the control panel, you can select the Kubernetes clusters to use with your registry. This generates a secret, adds it to all the namespaces in the cluster and updates the default service account to include the secret, allowing you to pull images from the registry.

To pull private container images from your DigitalOcean Container Registry into your DOKS cluster:

1. Go to your [DigitalOcean Container Registry](https://cloud.digitalocean.com/registry) dashboard
2. Click the **Settings** tab
3. Under **Kubernetes Integration**, click **Edit**
4. Select your DOKS cluster(s) to integrate
5. Click **Save**

This integration will:
- Automatically create a Kubernetes Secret for image pulls
- Patch default service accounts in all namespaces
- Allow seamless image pulls from the private registry

> [!Note]
> You can only integrate the latest Kubernetes patch versions (1.19+) with the registry. For more information on upgrading your Kubernetes clusters, see How to Upgrade DOKS Clusters to Newer Versions.



## Step 2: Create a DOKS Cluster

### Option A: Using doctl

```bash
doctl kubernetes cluster create web-app-cluster \
--region nyc3 \
--version 1.33.1-do.1 \
--count 1 \
--size s-1vcpu-1gb \
--enable-autoscaling \
--min-nodes 1 \
--max-nodes 2
```

### Option B: Using DigitalOcean Console

1. Go to [DOKS Console](https://cloud.digitalocean.com/kubernetes)
2. Click "Create Kubernetes Cluster"
3. Set:
   - Region: Your preferred location
   - Version: Latest stable
   - Node Pool:
     - Size: Basic (e.g., s-2vcpu-2gb or smaller)
     - Autoscaling: Enabled
     - Min: 2 nodes
     - Max: 3 nodes
4. Click "Create Cluster"

---

## Step 3: Connect to the Cluster

```bash
doctl kubernetes cluster kubeconfig save web-app-cluster
kubectl get nodes
```

---

## Step 4: Create Namespace and Deploy App

```bash
kubectl create ns webapp
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl get pod -n webapp
```

---

## Step 5: Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## Step 6: Enable HPA

```bash
kubectl apply -f app-hpa.yaml
```

---

## Step 7 (Optional): Use DO Spaces and CDN

```bash
doctl spaces create webapp-space
doctl spaces upload index.html webapp-space
```

Enable CDN in DigitalOcean Spaces UI. Use CDN endpoint for static hosting.


---

## Cost and Performance Summary

| Optimization Item       | Status  | Notes                             |
|-------------------------|---------|-----------------------------------|
| Smallest node size      | Enabled | s-1vcpu-1gb                       |
| HPA                     | Enabled | Scales pods based on CPU          |
| Resource limits         | Applied | 10m CPU, 16Mi RAM per pod         |
| CDN + DO Spaces         | Suggested | Reduces infra to ~$5/month       |
| Estimated Total Cost    | ~$7–14/month | With CDN: as low as ~$5       |

---