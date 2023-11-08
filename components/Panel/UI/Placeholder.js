function Placeholder() {
  return (
    <div role="status" className="w-full animate-pulse">
      {[...Array(2).keys()].map((el) => (
        <div key={el}>
          <div className="flex flex-row">
            <div className="h-2 bg-th-secondary-100 rounded-full w-1/12 mb-4 mr-4"></div>
            <div className="h-2 bg-th-secondary-100 rounded-full w-11/12 mb-4 mr-4"></div>
          </div>
          <div className="h-2 bg-th-secondary-100 rounded-full mb-4"></div>
          <div className="h-2 bg-th-secondary-100 rounded-full max-w-xs mb-6"></div>
        </div>
      ))}
    </div>
  )
}

export default Placeholder
