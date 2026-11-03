import { Week, p, h, code, bash, table, tip, warn, key, ul, q } from './types';

export const week9: Week = {
  n: 9,
  title: 'Deep Learning with PyTorch',
  month: 'Month 3 · Professional',
  emoji: '🧠',
  goal: 'Understand neural networks and build, train, and evaluate them yourself.',
  daily: [
    'Day 1: Neurons, layers, activation, loss, backpropagation (idea)',
    'Day 2: PyTorch tensors and autograd',
    'Day 3: Your first neural network (tabular data)',
    'Day 4: Training loop done right: validation, early stopping, regularization',
    'Day 5: Image classification with a CNN',
    'Day 6: Transfer learning, text/sequence overview + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w9-l1',
      title: '9.1 The Big Idea',
      blocks: [
        p('A neural network is many simple units stacked in layers.'),
        ul('**Neuron:** output = activation(w · x + b)', '**Activation** (ReLU, sigmoid) adds curves so the network can learn non-linear patterns.', '**Loss** measures how wrong we are (MSE for regression, cross-entropy for classification).', '**Backpropagation** computes the gradient of the loss for every weight.', '**Optimizer** (SGD, Adam) updates the weights using the gradient.'),
        key('When to use deep learning: images, audio, text, very large data. For ordinary tables, gradient boosting is usually as good or better, and much simpler.'),
        bash`pip install torch torchvision`,
      ],
    },
    {
      id: 'w9-l2',
      title: '9.2 Tensors and Autograd',
      blocks: [
        code`
import torch

x = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print(x.shape, x.dtype, x.mean())
print(x @ x.T)

# Autograd: PyTorch computes derivatives for us
w = torch.tensor(2.0, requires_grad=True)
loss = (w * 3 - 12) ** 2        # loss = (3w - 12)^2
loss.backward()
print(w.grad)                    # d loss/dw = 2*(3w-12)*3 = -36

device = "cuda" if torch.cuda.is_available() else "cpu"
print("Using:", device)`,
      ],
    },
    {
      id: 'w9-l3',
      title: '9.3 First Neural Network (Tabular)',
      blocks: [
        code`
import torch, torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, accuracy_score

torch.manual_seed(0)
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
X_tr, X_val, y_tr, y_val = train_test_split(X_tr, y_tr, test_size=0.2, stratify=y_tr, random_state=0)

sc = StandardScaler().fit(X_tr)
to_t = lambda a, dtype=torch.float32: torch.tensor(a, dtype=dtype)
Xtr, Xva, Xte = to_t(sc.transform(X_tr)), to_t(sc.transform(X_val)), to_t(sc.transform(X_te))
ytr, yva = to_t(y_tr).unsqueeze(1), to_t(y_val).unsqueeze(1)

train_loader = DataLoader(TensorDataset(Xtr, ytr), batch_size=32, shuffle=True)

class Net(nn.Module):
    def __init__(self, n_in):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_in, 32), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(32, 16), nn.ReLU(),
            nn.Linear(16, 1),            # raw score (logit)
        )
    def forward(self, x):
        return self.net(x)

model = Net(Xtr.shape[1])
loss_fn = nn.BCEWithLogitsLoss()                      # sigmoid + cross-entropy
opt = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)

best_val, patience, bad = float("inf"), 10, 0
for epoch in range(200):
    model.train()
    for xb, yb in train_loader:
        opt.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        opt.step()

    model.eval()
    with torch.no_grad():
        val_loss = loss_fn(model(Xva), yva).item()
    if val_loss < best_val - 1e-4:
        best_val, bad = val_loss, 0
        best_state = {k: v.clone() for k, v in model.state_dict().items()}
    else:
        bad += 1
        if bad >= patience:                          # early stopping
            print("Stopped at epoch", epoch)
            break

model.load_state_dict(best_state)`,
        key('The training loop recipe (memorize it): zero_grad → forward → loss → backward → step. Use model.train() for training and model.eval() with torch.no_grad() for evaluation.'),
        tip('Fighting overfitting: more data, dropout, weight decay, smaller network, early stopping, data augmentation.'),
      ],
    },
    {
      id: 'w9-l4',
      title: '9.4 Image Classification with a CNN',
      blocks: [
        p('A CNN uses small filters that slide over an image to detect edges, then shapes, then objects.'),
        code`
import torchvision, torchvision.transforms as T

transform = T.Compose([T.ToTensor(), T.Normalize((0.5,), (0.5,))])
train_ds = torchvision.datasets.MNIST("data", train=True, download=True, transform=transform)
train_dl = DataLoader(train_ds, batch_size=128, shuffle=True)

class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),   # 28 -> 14
            nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),  # 14 -> 7
        )
        self.head = nn.Sequential(nn.Flatten(), nn.Linear(32 * 7 * 7, 64),
                                  nn.ReLU(), nn.Linear(64, 10))
    def forward(self, x):
        return self.head(self.features(x))

cnn = CNN().to(device)
opt = torch.optim.Adam(cnn.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()
# ...same loop: zero_grad → forward → loss → backward → step
torch.save(cnn.state_dict(), "mnist_cnn.pt")`,
        p('On a CPU this takes a few minutes. You should reach about 98 to 99 percent.'),
      ],
    },
    {
      id: 'w9-l5',
      title: '9.5–9.6 Transfer Learning and Architectures',
      blocks: [
        p('Do not train big image models from scratch. Reuse a model already trained on millions of images.'),
        code`
import torchvision.models as models

resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
for p in resnet.parameters():
    p.requires_grad = False                     # freeze the pre-trained body
resnet.fc = nn.Linear(resnet.fc.in_features, 3) # new head for 3 of your own classes
# Train only resnet.fc on your own images (torchvision.datasets.ImageFolder)`,
        table(['Type', 'Used for'], [
          ['Fully connected (MLP)', 'Tabular data, simple tasks'],
          ['CNN', 'Images'],
          ['RNN / LSTM / GRU', 'Older sequence models'],
          ['Transformer', 'Text, modern vision, audio, large language models'],
          ['Autoencoder', 'Compression, anomaly detection'],
        ]),
        warn('Learn transformers next, after this book: attention, tokenization, and fine-tuning with Hugging Face.'),
      ],
    },
  ],
  exercises: [
    'Change the tabular net: try 1, 2, 3 hidden layers. Record validation loss.',
    'Compare your network against LightGBM on the same data. Which is better, and which is simpler?',
    'Add data augmentation (RandomRotation) to the MNIST training transform.',
    'Use transfer learning on a small dataset of your own (e.g. 3 types of leaves or products with 50 photos each).',
    'Plot training and validation loss per epoch. Describe what overfitting looks like in the plot.',
  ],
  project: {
    title: 'Mini Project 9: Image Classifier',
    desc: 'Collect (or download) a small image dataset with 3 to 5 classes. Use transfer learning with ResNet18. Report accuracy, a confusion matrix, and 5 examples the model got wrong, with your guess why.',
  },
  checklist: [
    'I can write a PyTorch training loop from memory',
    'I use validation and early stopping',
    'I know when NOT to use deep learning',
    'I can fine-tune a pre-trained model',
  ],
  quiz: [
    q('Correct order of the PyTorch training step?', ['step → backward → loss → zero_grad', 'zero_grad → forward → loss → backward → step', 'forward → step → backward', 'loss → forward → step'], 1, 'Reset gradients, forward pass, loss, backprop, update.'),
    q('What does loss.backward() do?', ['Updates weights', 'Computes gradients for every weight', 'Saves the model', 'Evaluates the test set'], 1, 'Backpropagation computes gradients; optimizer.step() applies them.'),
    q('Why use torch.no_grad() during evaluation?', ['It saves memory and skips gradient tracking', 'It trains faster', 'It enables dropout', 'It is required for GPUs'], 0, 'No gradients are needed when evaluating.'),
    q('For ordinary tabular data, which is usually the best first choice?', ['Transformer', 'CNN', 'Gradient boosting', 'GAN'], 2, 'Gradient boosting is usually as good or better and simpler.'),
    q('In transfer learning, what do we freeze?', ['The new head', 'The pre-trained body', 'The dataset', 'The loss'], 1, 'We keep pre-trained weights fixed and train a new head.'),
    q('Early stopping stops training when…', ['Training loss is zero', 'Validation loss stops improving', 'GPU is full', 'Epoch 10 is reached'], 1, 'It watches validation loss to avoid overfitting.'),
  ],
};

export const week10: Week = {
  n: 10,
  title: 'Deployment: Streamlit, FastAPI, Docker',
  month: 'Month 3 · Professional',
  emoji: '🚀',
  goal: 'A model that stays in a notebook helps nobody. Make it usable.',
  daily: [
    'Day 1: Save and load models correctly',
    'Day 2: Streamlit web app',
    'Day 3: FastAPI prediction API',
    'Day 4: Testing the API, input validation',
    'Day 5: Docker',
    'Day 6: Free hosting + Mini Project',
    'Day 7: Rest and revision',
  ],
  lessons: [
    {
      id: 'w10-l1',
      title: '10.1 Train and Save a Model',
      blocks: [
        bash`pip install fastapi uvicorn streamlit pydantic httpx pytest`,
        p('Create `src/train.py`:'),
        code`
# src/train.py
import joblib, numpy as np, pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(0)
n = 3000
df = pd.DataFrame({
    "age": rng.integers(18, 70, n),
    "months_active": rng.integers(1, 60, n),
    "support_calls": rng.poisson(2, n),
    "plan": rng.choice(["basic", "standard", "premium"], n),
})
logit = -2 + 0.4 * df["support_calls"] - 0.04 * df["months_active"] + (df["plan"] == "basic") * 0.8
df["churned"] = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)

X, y = df.drop(columns="churned"), df["churned"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=0)

prep = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]),
     ["age", "months_active", "support_calls"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["plan"]),
])
pipe = Pipeline([("prep", prep), ("clf", RandomForestClassifier(200, random_state=0))])
pipe.fit(X_tr, y_tr)
print("AUC:", round(roc_auc_score(y_te, pipe.predict_proba(X_te)[:, 1]), 3))

joblib.dump(pipe, "models/churn_model.joblib")`,
        bash`mkdir -p models src && python src/train.py`,
        key('Save the WHOLE pipeline, not only the model, so the same preprocessing runs in production.'),
      ],
    },
    {
      id: 'w10-l2',
      title: '10.2 Streamlit App',
      blocks: [
        code`
# app.py
import joblib
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Churn Predictor", page_icon="📉")
st.title("Customer Churn Predictor")

@st.cache_resource
def load_model():
    return joblib.load("models/churn_model.joblib")

model = load_model()

col1, col2 = st.columns(2)
age = col1.slider("Age", 18, 70, 35)
months = col1.slider("Months active", 1, 60, 12)
calls = col2.number_input("Support calls", 0, 30, 2)
plan = col2.selectbox("Plan", ["basic", "standard", "premium"])

if st.button("Predict"):
    row = pd.DataFrame([{"age": age, "months_active": months,
                         "support_calls": calls, "plan": plan}])
    p = model.predict_proba(row)[0, 1]
    st.metric("Churn probability", f"{p:.1%}")
    if p > 0.5:
        st.error("High risk. Consider a retention offer.")
    else:
        st.success("Low risk.")`,
        bash`streamlit run app.py`,
        tip('Free hosting: Streamlit Community Cloud (connect your GitHub repo, no server needed).'),
      ],
    },
    {
      id: 'w10-l3',
      title: '10.3 FastAPI Prediction API',
      blocks: [
        p('An API lets other programs (a website, a mobile app) use your model.'),
        code`
# api.py
from typing import Literal
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Churn API", version="1.0")
model = joblib.load("models/churn_model.joblib")

class Customer(BaseModel):
    age: int = Field(ge=18, le=100)
    months_active: int = Field(ge=0)
    support_calls: int = Field(ge=0)
    plan: Literal["basic", "standard", "premium"]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(c: Customer):
    row = pd.DataFrame([c.model_dump()])
    p = float(model.predict_proba(row)[0, 1])
    return {"churn_probability": round(p, 4), "high_risk": p > 0.5}`,
        bash`
uvicorn api:app --reload
# Open http://127.0.0.1:8000/docs for automatic interactive docs

curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"age": 30, "months_active": 5, "support_calls": 6, "plan": "basic"}'`,
        p('Pydantic checks inputs automatically. Wrong types or values return a clear **422** error instead of crashing.'),
      ],
    },
    {
      id: 'w10-l4',
      title: '10.4 Test the API',
      blocks: [
        code`
# tests/test_api.py
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)

def test_health():
    assert client.get("/health").json() == {"status": "ok"}

def test_predict_ok():
    r = client.post("/predict", json={"age": 30, "months_active": 5,
                                      "support_calls": 6, "plan": "basic"})
    assert r.status_code == 200
    assert 0 <= r.json()["churn_probability"] <= 1

def test_predict_bad_input():
    r = client.post("/predict", json={"age": 5, "months_active": 5,
                                      "support_calls": 6, "plan": "gold"})
    assert r.status_code == 422`,
        bash`pytest -q`,
      ],
    },
    {
      id: 'w10-l5',
      title: '10.5–10.6 Docker and Production Checklist',
      blocks: [
        p('Docker packages your app and everything it needs, so it runs the same everywhere.'),
        plainReq(),
        bash`
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY api.py .
COPY models/ models/
EXPOSE 8000
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]`,
        bash`
docker build -t churn-api .
docker run -p 8000:8000 churn-api`,
        warn('Use the same scikit-learn version for training and serving. A mismatch can break the saved model. Pin versions in requirements.txt (e.g. scikit-learn==1.5.2, from pip freeze).'),
        h('Production checklist'),
        ul('Input validation', 'Health endpoint', 'Logging of requests and errors', 'Model version in the response', 'Pinned library versions', 'Tests that pass', 'No secrets in the code (use environment variables)'),
      ],
    },
  ],
  exercises: [
    'Add an endpoint /predict_batch that accepts a list of customers.',
    'Log each prediction to a file with a timestamp.',
    'Add a "Why?" section in Streamlit that shows the top 3 features of the model.',
    'Deploy the Streamlit app on Streamlit Community Cloud and put the link in your README.',
  ],
  project: {
    title: 'Mini Project 10: Deploy Your Best Model',
    desc: 'Take your best model from Weeks 5 to 9. Deliver: a training script, a saved pipeline, a Streamlit app, a FastAPI service, a Dockerfile, tests, and a README with screenshots.',
  },
  checklist: [
    'I save the full pipeline with joblib',
    'I can build a Streamlit app and a FastAPI endpoint',
    'I can write simple tests',
    'I can build and run a Docker image',
  ],
  quiz: [
    q('Why save the whole pipeline instead of only the model?', ['Smaller file', 'The same preprocessing runs in production', 'Faster training', 'It is required by Docker'], 1, 'Preprocessing must be identical at prediction time.'),
    q('What HTTP status does FastAPI + Pydantic return for invalid input?', ['200', '404', '422', '500'], 2, '422 Unprocessable Entity with clear validation details.'),
    q('What does @st.cache_resource do?', ['Caches heavy objects like a loaded model', 'Deploys the app', 'Validates input', 'Creates a Dockerfile'], 0, 'It keeps the model in memory across reruns.'),
    q('Why pin library versions in requirements.txt?', ['Style', 'Version mismatches can break saved models', 'Docker requires it', 'Faster install'], 1, 'Training and serving must use compatible versions.'),
    q('Which command runs a FastAPI app with auto-reload?', ['streamlit run api.py', 'uvicorn api:app --reload', 'python -m docker', 'pytest api'], 1, 'uvicorn serves the ASGI app.'),
    q('Docker helps because…', ['It makes models more accurate', 'The app runs the same everywhere', 'It replaces Git', 'It trains models faster'], 1, 'It packages code and dependencies together.'),
  ],
};

function plainReq() {
  return bash`
# requirements.txt
fastapi
uvicorn
pandas
scikit-learn
joblib
pydantic`;
}
