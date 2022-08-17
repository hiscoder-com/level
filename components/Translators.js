function Translators({ projectCode }) {
  const test = [
    { url: 'https://avatars.githubusercontent.com/u/60795829?v=4', status: true },
    { url: 'https://avatars.githubusercontent.com/u/74174349?v=4', status: false },
    { url: 'https://avatars.githubusercontent.com/u/30548361?v=4', status: true },
    { url: 'https://avatars.githubusercontent.com/u/68908261?v=4', status: false },
  ]
  return (
    <div className="inline-flex">
      {test?.map((el, key) => {
        return (
          <div key={key}>
            <div
              style={{ backgroundImage: 'url(' + el.url + ')' }}
              className={
                'w-9 h-9 mx-1 rounded-full border-2 bg-contain bg-center bg-no-repeat'
              }
            >
              <div
                className={`w-2 h-2 ml-7 ${
                  el.status ? 'bg-green-500' : 'bg-amber-500'
                }  rounded-full`}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Translators
