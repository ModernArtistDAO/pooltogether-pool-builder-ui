import { useState } from 'react'
import { ethers } from 'ethers'
import Onboard from 'bnc-onboard'

import { Button } from 'lib/components/Button'
import { SRWPPBForm } from 'lib/components/SRWPPBForm'

import PoolAbi from './PoolAbi'

import PoolIcon from 'assets/images/holidays.svg'

export const IndexContent = () => {
  var DAI_ADDRESS = '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958'
  var USDC_ADDRESS = '0x0034ea9808e620a0ef79261c51af20614b742b24'

  let [onboard, setOnboard] = useState()
  let [config, setConfig] = useState()
  let [address, setAddress] = useState()

  let {
    provider, wallet
  } = config || {}

  if (!onboard) {
    onboard = Onboard({
      dappId: '77ae9152-5956-40aa-b745-4bb96d97fdfb',       // [String] The API key created by step one above
      networkId: 1,  // [Integer] The Ethereum network ID your Dapp uses.
      subscriptions: {
        wallet: w => {
          setConfig({
            wallet: w,
            provider: new ethers.providers.Web3Provider(w.provider)
          })
        }
      }
    });
    setOnboard(onboard)
  }

  async function connectWallet() {
    await onboard.walletSelect()

    const currentState = onboard.getState()

    if (currentState.wallet.type) {
      await onboard.walletCheck()

      const p = currentState.wallet.provider

      if (p && p.selectedAddress) {
        // trigger re-render
        setDaiBalance(ethers.utils.bigNumberify(0))
      }
    }
  }

  let withdrawUsdc = () => alert('not connected')
  let withdrawDai = () => alert('not connected')

  if (provider) {
    if (!address) {
      console.log(provider)
      provider.listAccounts().then(accounts => {
        setAddress(accounts[0])
      })
    }

    if (address) {
      let daiPool = new ethers.Contract(DAI_ADDRESS, PoolAbi, provider.getSigner())
      let usdcPool = new ethers.Contract(USDC_ADDRESS, PoolAbi, provider.getSigner())
  
      if (!daiBalance) {
        daiPool.totalBalanceOf(address).then((balance) => {
          setDaiBalance(balance)
        })
      }

      withdrawUsdc = () => {
        usdcPool['withdraw()']({ gasLimit: 1000000 })
      }

      withdrawDai = () => {
        daiPool['withdraw()']({ gasLimit: 1000000 })
      }
      
      if (!usdcBalance) {
        usdcPool.totalBalanceOf(address).then((balance) => {
          setUsdcBalance(balance)
        })  
      }
    }
  }

  let content
  const currentState = onboard.getState()

  return (
    <>
      <div
        className='mt-10 mb-20 lg:w-2/3'
      >
        <div
          className='text-blue-300 title text-xl sm:text-3xl'
        >
          SingleRandomWinner PrizePoolBuilder <img src={PoolIcon} className='inline-block w-10 h-10 ml-2' />
        </div>

        <p className='text-purple-100 my-4'>
          This builder creates a new Prize Pool that uses a Single Random Winner prize strategy. This strategy awards the prize periodically to a randomly selected winner.
        </p>

        <a
          href='https://docs.pooltogether.com/contracts/builders'
          className='trans'
        >View documentation</a>
      </div>

      
      {currentState.address ?
        <SRWPPBForm /> :
        <Button
          className='button'
          onClick={() => connectWallet()}
        >
          Connect Wallet
        </Button>
      }
      {content}
    </>
  )
}