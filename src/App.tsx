import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import RotatingText from './components/RotatingText';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import './App.css'


type Todo = {
  id: string;
  text:string;
  completed: boolean;
}

function App() {
  const [input, setInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('')

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    console.log('localStorageの中身:', saved);
    
    if(saved){
      try{
        console.log("パース後のデータ:", JSON.parse(saved))
        if(Array.isArray(JSON.parse(saved))){
          return JSON.parse(saved);
        }else{
          console.warn("配列ではないよ");
        }
      }catch(error){
        console.error("パースに失敗:", error);
      }
    }
    return [];
  });


  // リストが変更されたらlocalStorageに保存
  useEffect(()=>{
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);


  // 追加
  const addTodo = () => {
    if(!input.trim()) return;
    const newTodo: Todo = {
        id: crypto.randomUUID(),
        text:input,
        completed:false 
    };
    setTodos([...todos, newTodo]);
    setInput('');
  };

  // 削除
  const deleteTodo = (index: number) => {
    setTodos(todos.filter((_, i)=>i !== index ));
  };

  const toggleComplete = (index: number) => {
    const updated = [...todos];
    updated[index].completed = !updated[index].completed;
    setTodos(updated);
  };

  // 編集
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(todos[index].text);
  }

  // 編集保存
  const saveEdit = (index: number) => {
    const newTodos = [...todos];
    newTodos[index].text = editText;
    setTodos(newTodos);
    setEditingIndex(null);
    setEditText('');
  };


  // 並べ替え
  const handleSort = (result: DropResult) => {
    const { source, destination} = result;
    // 移動先なしの場合は何もしない
    if(!destination) return;

    const newTodos = [...todos];
    const [movedItem] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedItem);
    setTodos(newTodos);
  } 


  return (
    <>
      <h1 style={{ display:"flex", alignItems:"center"}}>
        <RotatingText texts={['BE', 'DO', 'HAVE']} interval={1500} />
        <span style={{ color:"white" }}>WHAT YOU WANT</span>
      </h1>
      <div style={{ display:'flex' }}>
        <input
          value={input}
          onChange={(e)=> setInput(e.target.value)}
          placeholder='What you want'
          className='inputTodo'
          />
        <button onClick={ addTodo }>
          <FaPlus />
        </button>
      </div>
      <DragDropContext onDragEnd={handleSort}>
        <Droppable droppableId='todoList'>
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
            {todos.map((todo, index)=>(
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided)=>(
                  <li key={index} className='added_todo'
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                  {editingIndex === index ? (
                    <>
                      <input
                        className='edit_input'
                        value={editText}
                        onChange={(e)=> setEditText(e.target.value)}
                      />
                      <button onClick={() => saveEdit(index)}>
                        <FaSave />
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <input
                          type="checkbox"
                          checked= {todo.completed}
                          onChange = {()=> toggleComplete(index)}
                        />
                        <span  className="todo_text" style={{ textDecoration:todo.completed ? 'line-through' : 'none' }}>
                          {todo.text}
                        </span>
                      </div>
                      <div>
                        <button onClick={()=>startEdit(index)} title='Edit'>
                          <FaEdit />
                        </button>
                        <button onClick={()=>deleteTodo(index)} title='Delete'>
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </li>
                )}
                </Draggable>
            ))}
          </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}

export default App
