export default function Placeholder() {
  return (
    <div
      role="status"
      className=" p-4 border border-gray-200 h-full shadow animate-pulse md:p-6 bg-white rounded-xl"
    >
      <div className="h-2.5 w-1/4 bg-gray-200 rounded-full mb-4"></div>
      {[...Array(6).keys()].map((el) => (
        <div key={el}>
          <div className="h-2 bg-gray-200 rounded-full mb-4"></div>
        </div>
      ))}
      <div className="h-2 bg-gray-200 rounded-full"></div>
      <div className="flex items-center mt-4 space-x-3">
        {[...Array(3).keys()].map((el) => (
          <div key={el}>
            <div className="h-8 btn w-1/3 mb-2"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
