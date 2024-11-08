function Placeholder() {
  return (
    <div role="status" className="w-full animate-pulse">
      {[...Array(2).keys()].map((el) => (
        <div key={el}>
          <div className="flex flex-row">
            <div className="mb-4 mr-4 h-2 w-1/12 rounded-full bg-th-secondary-100"></div>
            <div className="mb-4 mr-4 h-2 w-11/12 rounded-full bg-th-secondary-100"></div>
          </div>
          <div className="mb-4 h-2 rounded-full bg-th-secondary-100"></div>
          <div className="mb-6 h-2 max-w-xs rounded-full bg-th-secondary-100"></div>
        </div>
      ))}
    </div>
  )
}

export default Placeholder
