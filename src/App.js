import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";



const initialColumns = [
  {
    id: "column-1",
    title: "column-1",
    items: [
      { id: "task-1", text: "Task 1" },
      { id: "task-2", text: "Task 2" },
      { id: "task-3", text: "Task 3" },
    ],
  },
  {
    id: "column-2",
    title: "column-2",
    items: [
      { id: "task-4", text: "Task 4" },
      { id: "task-5", text: "Task 5" },
    ],
  },
  {
    id: "column-3",
    title: "column-3",
    items: [{ id: "task-6", text: "Task 6" }],
  },
]

const App = () => {
  const [columns, setColumns] = useState(initialColumns)

  // Состояние карточки, которую перетаскиваем
  const [dragCard, setDragCard] = useState({
    item: null,
    sourceColumn: null,
    overItem: null,
    position: null,
  })

  // Состояние столбца, который перетаскиваем
  const [dragColumn, setDragColumn] = useState(null)

  // Когда пользователь начинает тянуть карточку
  const handleCardDragStart = (e, item, columnId) => {
    setDragCard({ item, sourceColumn: columnId, overItem: null, position: null })
  }

  // Когда курсор проходит над другой карточкой
  const handleCardDragOver = (e, itemId) => {
    e.preventDefault()
    if (dragCard.item?.id === itemId) return

    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom"

    setDragCard(prev => ({ ...prev, overItem: itemId, position }))
  }

  // Когда курсор уходит с карточки
  const handleCardDragLeave = () => {
    setDragCard(prev => ({ ...prev, overItem: null, position: null }))
  }

  // Когда карточку "бросают" в новую колонку или позицию
  const handleCardDrop = (e, targetColumnId, targetItemId = null) => {
    e.preventDefault()
    if (!dragCard.item) return

    setColumns(prev => {
      const newColumns = JSON.parse(JSON.stringify(prev))

      const sourceColumn = newColumns.find(col => col.id === dragCard.sourceColumn)
      const targetColumn = newColumns.find(col => col.id === targetColumnId)
      if (!sourceColumn || !targetColumn) return prev

      const draggedIndex = sourceColumn.items.findIndex(item => item.id === dragCard.item.id)
      if (draggedIndex === -1) return prev

      const [movedItem] = sourceColumn.items.splice(draggedIndex, 1)

      // Если переносим в другую колонку, избегаем дублирования
      if (sourceColumn.id !== targetColumn.id) {
        if (targetColumn.items.some(item => item.id === movedItem.id)) {
          sourceColumn.items.splice(draggedIndex, 0, movedItem)
          return newColumns
        }
      }

      if (targetItemId) {
        const targetIndex = targetColumn.items.findIndex(item => item.id === targetItemId)
        const insertPosition = dragCard.position === "bottom" ? targetIndex + 1 : targetIndex
        targetColumn.items.splice(insertPosition, 0, movedItem)
      } else {
        targetColumn.items.push(movedItem)
      }

      return newColumns
    })

    setDragCard({ item: null, sourceColumn: null, overItem: null, position: null })
  }

  // Перетаскивание колонок
  const handleColumnDragStart = (e, columnId) => {
    e.stopPropagation()
    setDragColumn(columnId)
  }

  const handleColumnDragOver = (e) => {
    e.preventDefault()
  }

  const handleColumnDrop = (e, targetColumnId) => {
    e.preventDefault()
    if (!dragColumn || dragColumn === targetColumnId) return

    setColumns(prev => {
      const sourceIndex = prev.findIndex(col => col.id === dragColumn)
      const targetIndex = prev.findIndex(col => col.id === targetColumnId)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const newColumns = [...prev]
      const [movedColumn] = newColumns.splice(sourceIndex, 1)
      newColumns.splice(targetIndex, 0, movedColumn)

      return newColumns
    })

    setDragColumn(null)
  }

  // Подсветка рамки при наведении
  const getBorderStyle = (itemId) => {
    if (dragCard.overItem !== itemId) return {}
    if (dragCard.position === "top") return { borderTop: "3px solid #3b82f6" }
    if (dragCard.position === "bottom") return { borderBottom: "3px solid #3b82f6" }
    return {}
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-center mb-20 text-3xl font-semibold text-red-900 capitalize">
        drag-n-drop
      </h1>

      <div className="flex gap-4 justify-center">
        <AnimatePresence initial={false}>
          {columns.map((column) => (
            <motion.div
              key={column.id}
              layout
              className="bg-white rounded-lg shadow-md p-4 w-64 flex flex-col"
              draggable
              onDragStart={(e) => handleColumnDragStart(e, column.id)}
              onDragOver={handleColumnDragOver}
              onDrop={(e) => handleColumnDrop(e, column.id)}
            >
              <h2 className="text-lg font-bold mb-4 text-center cursor-move py-3 bg-slate-300 rounded-md">
                {column.title}
              </h2>

              {/* Область с карточками */}
              <motion.div
                layout
                className="flex flex-col gap-2 min-h-20 bg-gray-50 p-2 rounded-md"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCardDrop(e, column.id)
                }}
              >
                <AnimatePresence>
                  {/* Если есть карточки — отображаем каждую */}
                  {column.items.length > 0 ? (
                    <>
                      {column.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-blue-100 p-2 rounded-md text-center cursor-move hover:bg-blue-200"
                          style={getBorderStyle(item.id)}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation()
                            handleCardDragStart(e, item, column.id)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleCardDragOver(e, item.id)
                          }}
                          onDragLeave={handleCardDragLeave}
                          onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleCardDrop(e, column.id, item.id)
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {item.text}
                        </motion.div>
                      ))}

                      {/* Область Drop here после всех карточек */}
                      <div
                        className="h-12 mt-2 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm hover:border-blue-400 transition-all"
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCardDrop(e, column.id)
                        }}
                      >
                        Drop here
                      </div>
                    </>
                  ) : (
                    // Пустой столбец: одна зона "Drop here"
                    <motion.div
                      layout
                      className="h-24 flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 text-sm hover:border-blue-400 transition-all"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCardDrop(e, column.id)
                      }}
                    >
                      Drop here
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
