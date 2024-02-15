function Demo({ t }) {
  return (
    <div className="flex flex-col w-full">
      <p className="hidden md:block">{t('Demo')}</p>
      <div className="flex flex-grow flex-col items-center justify-center gap-14 pb-6 md:pb-0">
        <img
          src="/underconstruction.png"
          alt="Unredconstruction image"
          className="w-full h-auto"
        />
        <p>{t('ComingSoon')}</p>
      </div>
    </div>
  )
}

export default Demo
