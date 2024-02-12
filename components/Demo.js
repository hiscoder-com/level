function Demo({ t }) {
  return (
    <div className="flex flex-col w-full">
      <p className="hidden md:block">{t('Demo')}</p>
      <div className="flex flex-grow items-center pb-6 md:pb-0">
        <img
          src="/underconstruction.png"
          alt="Unredconstruction image"
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}

export default Demo
