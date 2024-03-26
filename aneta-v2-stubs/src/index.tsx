import React from 'react'; // Import React
import ReactDOM from 'react-dom';
import './index.css';
import './App.css';
import { Lucid, Blockfrost, Data, Constr } from 'lucid-cardano';
import { useState } from 'react';

const MintRequesrSchema = Data.Object({
  amount: Data.Integer(),
  path: Data.Integer(),
});

const keyHashArray = Data.Array(Data.Integer());

const MultisigDescriptorSchema = Data.Object({ 
  list: Data.Array(Data.Bytes()),
  m: Data.Integer(),
});



type MintRequest = Data.Static<typeof MintRequesrSchema>;
const MintRequest = MintRequesrSchema as unknown as MintRequest;

type MultisigDescriptor = Data.Static<typeof MultisigDescriptorSchema>;
const MultisigDescriptor = MultisigDescriptorSchema as unknown as MultisigDescriptor;

function App() {
  const [address, setAddress] = useState('addr_test1qqjg030vffsy7jav0802dr5unfv06dn5avtqh7028ykrd2l3meyrd8efkt952egccka06epqkye4j9fnrarjjjhrxz2sufjewr');
  const [amount, setAmount] = useState(0.0001);

  const [keyHash, setKeyHash] = useState(["00fb9ebd6baf0680bdf8da11f87eaca9715d1f9ffa9c83241c643e53"])
  const [m, setM] = useState(1)

  async function sendMintRequest() {  
    const lucid = await  Lucid.new( await new Blockfrost("https://passthrough.broclan.io", "preview"), "Preview" )
    console.log(await lucid.provider.getProtocolParameters())
    const nami = await window.cardano.nami.enable()
    lucid.selectWallet(nami)
    const tx =  lucid.newTx()
    const data = Data.to({ amount: BigInt(amount * 10_000_000), path: 1n }, MintRequest);

    tx.payToContract(address, {inline : data} , {"lovelace":  2_000_000n} )
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
    tx.payToAddressWithData(await lucid.wallet.address(),  
                                {inline : data} , {"lovelace":  2_000_000n, "a653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae634e65746142726964676541646d696e": 1n} )
    const unsignedTx =await tx.complete()
    console.log(unsignedTx.toString())
    const signature = await nami.signTx(unsignedTx.toString(), true)
    unsignedTx.assemble([signature])
    const completedTx = await unsignedTx.complete()
    const txHash = await completedTx.submit()
    console.log(txHash)

  }

  return (
    <div className="App">
      <header className="App-header">
      <div className="mintRequest">
        send mint request
      <input type="text" placeholder='address' value={address} onChange={(event) => setAddress(event.target.value)}   ></input>
      <input type="number" placeholder='amount' value={amount} onChange={(event) => setAmount(Number(event.target.value))}  ></input>
      <button onClick={sendMintRequest}>send mint request</button>
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