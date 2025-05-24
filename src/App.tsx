import { useState, useEffect, useMemo } from 'react';
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
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editText, setEditText] = useState('')
  const [searchWord, setSearchWord] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const ITEMS_PER_LOAD = 3;

  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("https://aklzs4npvam2qxnmpjv6pi7fj40ubcxb.lambda-url.ap-northeast-1.on.aws/") // ← Lambda関数URL
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("エラー:", err));
  }, []);


  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    if(saved){
      try{
        if(Array.isArray(JSON.parse(saved))){
          return JSON.parse(saved);
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
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo=> todo.id != id));
  };

  const toggleComplete = (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? {...todo, completed:!todo.completed } : todo
    );
    setTodos(updated);
  };

  // 編集
  const startEdit = (id: string) => {
    setEditingIndex(id);
    const target = todos.find(todo=> todo.id === id);
    setEditText(target?.text ?? '');
  }

  // 編集保存
  const saveEdit = (id: string) => {
    const updated = todos.map(todo => 
      todo.id === id ? {...todo, text:editText} : todo
    );
    setTodos(updated);
    setEditingIndex(null);
    setEditText('');
  };


  // ドラッグ＆ドロップ並べ替え
  const handleSort = (result: DropResult) => {
    const { source, destination} = result;
    // 移動先なしの場合は何もしない
    if(!destination) return;

    const newTodos = [...todos];
    const [movedItem] = newTodos.splice(source.index, 1);
    newTodos.splice(destination.index, 0, movedItem);
    setTodos(newTodos);
  } 

  // 検索と並べ替え
  const filteredAndSortedTodos = useMemo(()=>{
    // 検索フィルター
    const filtered = todos.filter(todo => 
      todo.text.toLowerCase().includes(searchWord.toLowerCase())
    );

    // 並び替え（未完了タスクを上に)
    return [...filtered].sort((a, b)=>{
      return Number(a.completed) - Number(b.completed);
    });
  }, [todos, searchWord]);

  // 無限スクロール(画面下部までスクロールしたら読み込み)
  const displayTodos = useMemo(()=> {
    return filteredAndSortedTodos.slice(0, visibleCount);
  }, [filteredAndSortedTodos, visibleCount]);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      if (nearBottom) {
        setVisibleCount((prev) => {
          if (prev < filteredAndSortedTodos.length) {
            return prev + ITEMS_PER_LOAD;
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredAndSortedTodos.length]);


  return (
    <>
    <header>
      <div className="header">
        <div>
          <h1>Lambdaからのメッセージ：</h1>
          <p>{message}</p>
        </div>
        <h1 style={{ display:"flex", alignItems:"center"}}>
          <RotatingText texts={['BE', 'DO', 'HAVE']} interval={1500} />
          <span style={{ color:"white" }}>WHAT YOU WANT</span>
        </h1>
        <div style={{ display: 'flex', marginBottom:'15px' }}>
          <input
            value={searchWord}
            onChange={(e)=>setSearchWord(e.target.value)}
            placeholder='🔍 Search lists'
            className='inputTodo'
          />
        </div>
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
      </div> 
    </header>{/* end of header */}

      <main>
        <DragDropContext onDragEnd={handleSort}>
          <Droppable droppableId='todoList'>
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
              {displayTodos.map((todo, index)=>(
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided)=>(
                    <li 
                      className='added_todo'
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                    {editingIndex === todo.id ? (
                      <>
                        <input
                          className='edit_input'
                          value={editText}
                          onChange={(e)=> setEditText(e.target.value)}
                        />
                        <button onClick={() => saveEdit(todo.id)}>
                          <FaSave />
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <input
                            type="checkbox"
                            checked= {todo.completed}
                            onChange = {()=> toggleComplete(todo.id)}
                          />
                          <span  className="todo_text" style={{ textDecoration:todo.completed ? 'line-through' : 'none' }}>
                            {todo.text}
                          </span>
                        </div>
                        <div>
                          <button onClick={()=>startEdit(todo.id)} title='Edit'>
                            <FaEdit />
                          </button>
                          <button onClick={()=>deleteTodo(todo.id)} title='Delete'>
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                  )}
                  </Draggable>
              ))}
              {provided.placeholder}
            </ul>
            )}
          </Droppable>
        </DragDropContext>
      </main>
    </>
  );
}

export default App;
