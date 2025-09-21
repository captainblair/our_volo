export default function StatCard({title, value}){
  return (
    <div className="p-4 rounded-2xl shadow-sm bg-white border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
