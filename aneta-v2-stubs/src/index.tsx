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

type MintRequest = Data.Static<typeof MintRequesrSchema>;
const MintRequest = MintRequesrSchema as unknown as MintRequest;

function App() {
  const [address, setAddress] = useState('addr_test1qpvrwlxha2a3lm8pfav6u4nd2qx5evmqk860fpwzwfs557khyrrgpn6l5dsvvus8hxa5kmh933ppnyqq79ke343t5z0swrdk0e');
  const [amount, setAmount] = useState(0.0001);

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

  return (
    <div className="App">
      <header className="App-header">
        send mint request
      <input type="text" placeholder='address' value={address} onChange={(event) => setAddress(event.target.value)}   ></input>
      <input type="number" placeholder='amount' value={amount} onChange={(event) => setAmount(Number(event.target.value))}  ></input>
      <button onClick={sendMintRequest}>send mint request</button>
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