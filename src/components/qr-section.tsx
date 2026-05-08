import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'

const QrSection: React.FC = () => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [remaining, setRemaining] = useState(-1)
  const [secret, setSecret] = useState('')
  const [isDisplay, setIsDisplay] = useState(false)
  const [intervalNumber, setIntervalNumber] = useState<NodeJS.Timeout | null>(
    null,
  )

  const generateHandler = async () => {
    const secret = new OTPAuth.Secret({ size: 20 }).base32
    setSecret(secret)
    const totp = new OTPAuth.TOTP({
      issuer: 'PeerAuth',
      label: encodeURIComponent(name),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    })
    setUrl(await QRCode.toDataURL(totp.toString()))
    function updateOtpDisplay() {
      const now = Math.floor(Date.now() / 1000)
      const remaining = totp.period - (now % totp.period)
      setToken(`${totp.generate()}`)
      setRemaining(remaining)
    }
    updateOtpDisplay()
    setIsDisplay(true)
    if (intervalNumber) clearInterval(intervalNumber)
    setIntervalNumber(setInterval(updateOtpDisplay, 1000))
  }

  return (
    <>
      <label className='form-label'>{t('title')}</label>
      <br />
      <input
        type='text'
        className='form-control input-title'
        id='name'
        required
        onChange={(e) => setName(e.target.value)}
      />
      <br />
      <button
        id='generateBtn'
        className='btn btn-primary mb-4'
        disabled={!name}
        onClick={generateHandler}
      >
        {t('generate')}
      </button>
      <br />
      {isDisplay && (
        <div id='qrSection'>
          <div className='row'>
            <div className='col mb-5 text-center align-content-center qr-column'>
              <p>{t('pleaseScan')}</p>
              <div id='qrcode' className='d-flex justify-content-center'>
                <img src={url} />
              </div>
            </div>
            <div className='col mb-5 text-center align-content-center qr-column'>
              <h4>{t('verificationOTP')}</h4>
              <p id='otpDisplay1' className='h2'>
                {token}
              </p>
              <p>
                <span>{t('expiresIn')}</span>
                <span id='countdown'>{remaining}</span>
                <span>{t('seconds')}</span>
              </p>
            </div>
          </div>
          <p>{t('base32secret')}</p>
          <p id='secret' className='font-monospace'>
            {secret}
          </p>
          <br />
        </div>
      )}
    </>
  )
}

export default QrSection
