import React from 'react'; // Import React
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import { Lucid, Blockfrost, Data, Constr } from 'lucid-cardano';
import { useState } from 'react';


const RedemptionRequestSchema = Data.Object({
  destinationAddress: Data.Bytes()
});

const adminTokens = { "Private1" : "a653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae634e65746142726964676541646d696e",
                      "Private2" : "592fb0f9d8ed15c06858118d134d5c4b7c77320507810fee9ac2ddf954686548756e74696e674f6654686557696c64",
                      "toProduction" : "79dfc51ebff0b40e596e6ce59a0e3306038c7214afd40f9bf1f15cd101a11f28a72b39d9e37cdd96b86983adc5acb72ea6c8edfe04f5a9d5d57895ba"
}

const MintRequesrSchema = Data.Object({
  amount: Data.Integer(),
  path: Data.Integer(),
});

const keyHashArray = Data.Array(Data.Integer());

const MultisigDescriptorSchema = Data.Object({ 
  list: Data.Array(Data.Bytes()),
  m: Data.Integer(),
});

type RedemptionRequest = Data.Static<typeof RedemptionRequestSchema>;
const RedemptionRequest = RedemptionRequestSchema as unknown as RedemptionRequest;


type MintRequest = Data.Static<typeof MintRequesrSchema>;
const MintRequest = MintRequesrSchema as unknown as MintRequest;

type MultisigDescriptor = Data.Static<typeof MultisigDescriptorSchema>;
const MultisigDescriptor = MultisigDescriptorSchema as unknown as MultisigDescriptor;

function App() {
 // const [address, setAddress] = useState('addr_test1wz2ajd694hd2qsjf0wmmmznruxsl885y3mlc2lkqaxqu02ggz7mzm'); // testnet1
 const [address, setAddress] = useState('addr_test1wqq7gshkf4c27gm0rjf7dck6map5dh35llp5pkpnk3f9czg8cemve');  //to production
 const [amount, setAmount] = useState(0.0001);
  const [redemptionAmount, setRedemptionAmount] = useState(0.0001);
  const [destinationAddress, setDestinationAddress] = useState('tb1qdgf2y590vg6pya78sdfkjx047prjafgp90ek23');
  const [path, setPath] = useState(1)
  const [keyHash, setKeyHash] = useState(["00fb9ebd6baf0680bdf8da11f87eaca9715d1f9ffa9c83241c643e53"])
  const [m, setM] = useState(1)
  const [adminToken , setAdminToken] = useState("Private1")
  
  async function sendMintRequest() {
    const lucid = await  Lucid.new( await new Blockfrost("https://passthrough.broclan.io", "preview"), "Preview" )
    console.log(await lucid.provider.getProtocolParameters())
    const nami = await window.cardano.nami.enable()
    lucid.selectWallet(nami)
    const tx =  lucid.newTx()
    const data = Data.to({ amount: BigInt(amount * 100_000_000), path: BigInt(path) }, MintRequest);

    tx.payToContract(address, {inline : data} , {"lovelace":  50_000_000n} )
    const unsignedTx =await tx.complete()
    console.log(unsignedTx.toString())
    const signature = await nami.signTx(unsignedTx.toString(), true)
    unsignedTx.assemble([signature])
    const completedTx = await unsignedTx.complete()
    const txHash = await completedTx.submit()
    console.log(txHash)
  }

  function stringToHex(str) {
    let hex = '';
    for(let i = 0; i < str.length; i++) {
        let hexChar = str.charCodeAt(i).toString(16);
        hex += hexChar.padStart(2, '0');
    }
    return hex;
}

async function sendBrokenRequest() {
  const lucid = await  Lucid.new( await new Blockfrost("https://passthrough.broclan.io", "preview"), "Preview" )
  const nami = await window.cardano.nami.enable()
  lucid.selectWallet(nami)
  const tx =  lucid.newTx()
  const data = Data.to( {  destinationAddress : stringToHex(destinationAddress) } , RedemptionRequest);
  tx.payToContract(address, {inline : data} , {"lovelace":  20_000_000n} )
  const unsignedTx =await tx.complete()
  console.log(unsignedTx.toString())
  const signature = await nami.signTx(unsignedTx.toString(), true)
  unsignedTx.assemble([signature])
  const completedTx = await unsignedTx.complete()
  const txHash = await completedTx.submit()
  console.log(txHash)
}


  async function sendRedeemRequest() {
    const lucid = await  Lucid.new( await new Blockfrost("https://passthrough.broclan.io", "preview"), "Preview" )
    const nami = await window.cardano.nami.enable()
    lucid.selectWallet(nami)
    const tx =  lucid.newTx()
    const data = Data.to( {  destinationAddress : stringToHex(destinationAddress) } , RedemptionRequest);

    tx.payToContract(address, {inline : data} , {"lovelace":  2_000_000n , "01e442f64d70af236f1c93e6e2dadf4346de34ffc340d833b4525c0963425443": BigInt(Math.floor(redemptionAmount * 100_000_000))} )
    const unsignedTx =await tx.complete()
    console.log(unsignedTx.toString())
    const signature = await nami.signTx(unsignedTx.toString(), true)
    unsignedTx.assemble([signature])
    const completedTx = await unsignedTx.complete()
    const txHash = await completedTx.submit()
    console.log(txHash)
  }

  async function setConfig() {
    const lucid = await  Lucid.new( await new Blockfrost("https://passthrough.broclan.io", "preview"), "Preview" )
    const nami = await window.cardano.nami.enable()
    lucid.selectWallet(nami)
    const data = Data.to({ list: keyHash , m: BigInt(m) }, MultisigDescriptor);
    const tx =  lucid.newTx()
    const adminTokenId = adminTokens[adminToken]
    const assets = {"lovelace":  2_000_000n}
    assets[adminTokenId] = 1n
    console.log(assets)
    tx.payToAddressWithData(await lucid.wallet.address(),  
                                    {inline : data} ,assets  )
    const unsignedTx =await tx.complete()
    console.log(unsignedTx.toString())
    const signature = await nami.signTx(unsignedTx.toString(), true)
    unsignedTx.assemble([signature])
    const completedTx = await unsignedTx.complete()
    const txHash = await completedTx.submit()
    console.log(txHash)

  }

  const config = {
    "fixedFee": 0,
    "margin": 0.005,
    "redemptionMargin": 0.9,   
    "utxoCharge": 0,
    "maxConsolidationTime" : 3,
    "consolidationThreshold" : 0.5,
    "minMint": 10000,
    "minRedemption": 10000,
    "btcNetworkFeeMultiplyer": 1.1,
    "btcNetworkFeeAsyncMultiplyer": 1.3,
    "maxBtcFeeRate" :  0.004,
    "mintDeposit": 50,
    "mintTimeoutMinutes": 120,   
    "adminAddress":  "addr_test1qrlmv3gjf253v49u8v5psxzwtlf6uljc5xf3a24ehfzcyz32ptyyevm796lgrkz2t5vrx3snmmsfh0ntc333mqf6eagstyc95m"
}



  return (
    <div className="App">
      <header className="App-header">
        <div className="wallet">
      <input type="text" placeholder='address' value={address} onChange={(event) => setAddress(event.target.value)}   ></input>
      </div>
      <div className="mintRequest ">
        send mint request
      <input type="number" placeholder='amount' value={amount} onChange={(event) => setAmount(Number(event.target.value))}  ></input>
      <input type="number" placeholder='path' value={path} onChange={(event) => setPath(Number(event.target.value))}  ></input>
      <div > Amount to pay :     {Number(amount) + config.fixedFee + config.margin *  Number(amount) } ; 
</div>
      <button onClick={sendMintRequest}>send mint request</button>
      </div>
      <div className="redeemRequest">
        send redeem request
      <input type="number" placeholder='amount' value={redemptionAmount} onChange={(event) => setRedemptionAmount(Number(event.target.value))}  ></input>
      <input type="text" placeholder='destinationAddress' value={destinationAddress} onChange={(event) => setDestinationAddress(event.target.value)}  ></input>
      <button onClick={sendRedeemRequest}>send redeem request</button>
      </div>
      <div className="redeemRequest">
        send broken request
      <input type="number" placeholder='amount' value={redemptionAmount} onChange={(event) => setRedemptionAmount(Number(event.target.value))}  ></input>
      <input type="text" placeholder='destinationAddress' value={destinationAddress} onChange={(event) => setDestinationAddress(event.target.value)}  ></input>
      <button onClick={sendBrokenRequest}>send broken request</button>
      </div>
      <br/>
      <div className="config">
        {keyHash.map((key, index) => {   
          return <input type='text' placeholder='keyHash' key={index} value={key} onChange={(event) => {
            const newKeyHash = [...keyHash];
            newKeyHash[index] = event.target.value;
            setKeyHash(newKeyHash);
          }}></input>
        })}
        <button onClick={() => setKeyHash([...keyHash, ""])}>add key hash</button>
        <input type="number" placeholder='m' value={m} onChange={(event) => setM(Number(event.target.value))}  ></input>
      <select onChange={(event) => setAdminToken(event.target.value)} value={adminToken}>
        {Object.keys(adminTokens).map((key) => {
          return <option value={key}>{key}</option>
        })}
      </select>
        <button onClick={() => setConfig()}>set config</button>
      </div>

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));