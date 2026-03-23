# dapp_proof_of_existence

contract address id- CBVQ2M5VHF24YF2M22HEKH55X5KGJV5KM3TJHUSDV3EUBUVEZBFSMGGN
https://stellar.expert/explorer/testnet/contract/CBVQ2M5VHF24YF2M22HEKH55X5KGJV5KM3TJHUSDV3EUBUVEZBFSMGGN

![image alt](https://github.com/roboBhaskar034/dapp_proof_of_existence/blob/99b0638171c83c210d31963f0a0069a0bdc8c885/Screenshot%202026-03-20%20153351.png)
![image alt](https://github.com/roboBhaskar034/dapp_proof_of_existence/blob/8a096daa3d154f8cd67a466a5cb25fa73a964a73/Screenshot%202026-03-20%20152629.png)
![image alt](https://github.com/roboBhaskar034/dapp_proof_of_existence/blob/8835fbeaa5e3adc3973257f25f50a1cbe3fbb761/Screenshot%202026-03-20%20154809.png)

📜 Proof of Existence (Soroban Smart Contract)

🚀 Project Description

This project implements a Proof of Existence system using the Soroban smart contract platform on the Stellar blockchain.

It allows users to securely store a cryptographic hash of any file or data, proving that the data existed at a specific point in time — without revealing the actual content.

---

⚙️ What it does

- Stores a hash (fingerprint) of a document on-chain
- Records the timestamp when the proof is submitted
- Allows anyone to verify the existence of that data later
- Ensures data integrity without storing the actual file

---

✨ Features

- 🔐 Secure & tamper-proof proof storage
- ⏱️ Timestamp-based verification
- 📂 Lightweight (stores only hashes, not files)
- 🔍 Public verification of proofs
- 🚫 Prevents duplicate entries
- ⚡ Built using Soroban (fast & efficient smart contracts)

---

🧪 Example Use Cases

- Document ownership proof
- Intellectual property protection
- Academic certificate validation
- Legal agreements timestamping

---

🛠️ Functions

"store_proof(hash)"

Stores a hash on the blockchain with timestamp.

- Returns "true" if stored
- Returns "false" if already exists

"verify_proof(hash)"

Checks if a hash exists on-chain.

"get_proof_time(hash)"

Returns the timestamp when the proof was stored.

---

🧑‍💻 Tech Stack

- Rust
- Soroban SDK
- Stellar Blockchain

---

📌 How to Use

1. Convert your file into a SHA-256 hash
2. Call "store_proof(hash)"
3. Save transaction ID as reference
4. Later, verify using "verify_proof(hash)"

---

💡 Future Improvements

- Add user identity (address mapping)
- File metadata storage
- Frontend UI (React + Stellar Wallet)
- API integration
