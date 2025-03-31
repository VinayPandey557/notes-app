import React, { useState } from 'react'
import Navbar from '../../components/Navbar';
import { NoteCard } from '../../components/NoteCard';
import { MdAdd } from 'react-icons/md';
import moment from "moment";
import AddEditNotes  from './AddEditNotes';
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import ToastMessage from '../../components/ToastMessage';
import EmptyCard from '../../components/EmptyCard';
import AddNoteImg from "../../assets/add-notes.svg";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type:"add",
    data:null
  });
  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add"
  });
  
  const [ allNotes, setAllNotes ] = useState([]);
  const [ userInfo , setUserInfo ] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const navigate = useNavigate();



  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit"})
  }


  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message ,
      type
    })
  }

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
      type: "add"
    })
  }
  //Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if(response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error){
      if(error.response.status === 401){
        localStorage.clear();
        navigate("/login");
      }
    }
  };


  const getAllNotes = async() => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      console.log(response);
      if(response.data && response.data.notes){
        setAllNotes(response.data.notes);
      }
    } catch(error){
      console.log("An unexpected error occurred. Please try again");
    }
  }



  const deleteNote = async (data) => {
    const noteId = data._id;

    console.log("Deleting note with ID:", noteId); // Debugging log

    try {
        const response = await axiosInstance.delete(`/delete-note/${noteId}`);

        console.log("Delete Response:", response.data);

        if (response.data && !response.data.error) {
            console.log("Note deleted successfully");
            showToastMessage("Note Deleted Successfully", "delete");
            getAllNotes();
        }
    } catch (error) {
        console.error("Error deleting note:", error.response?.data?.message || error.message);
    }
};

const onSearchNote =  async(query) => {
  try {
    const response = await axiosInstance.get("/search-notes", {
      params: {query},
    })
    if(response.data && response.data.notes){
      setIsSearch(true);
      setAllNotes(response.data.notes);
    }
  } catch(error){
    console.log(error);
  }
}


const updateIsPinned = async (noteData) => {
  if (!noteData || !noteData._id) {
    console.error("Invalid noteData:", noteData);
    return;
  }

  const noteId = noteData._id;
  console.log("Updating Note:", noteData);

  try {
    const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, {
      isPinned: !noteData.isPinned,
    });

    console.log("Server Response:", response.data);

    if (response.data && response.data.note) {
      showToastMessage("Note updated successfully");
      getAllNotes();
    }
  } catch (error) {
    console.error("Error updating note:", error.response?.data || error.message);
  }
};


const handleClearSearch = () => {
  setIsSearch(false);
  getAllNotes();
}

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, [])
  

    return (
     <>
     <Navbar  userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}  />

     <div className='container mx-auto'>
      { allNotes.length > 0 ? ( 
          <div className='grid grid-cols-3 gap-4 mt-8'>
          {allNotes.map((item, index) =>(
            <NoteCard 
            key={item._id}
             title={item.title}
             date={item.createdOn}
             content={item.content}
             tags={item.tags}
             isPinned={item.isPinned}
             onEdit={() => {handleEdit(item)}}
             onDelete={() => {deleteNote(item)}}
             onPinNote={() => {updateIsPinned(item)}}
            />
          ))}
        </div>
      ): (
        <EmptyCard imgSrc={AddNoteImg} message={`Start creating the first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Lets's get started! `} />
      )}
     
     </div>

     <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-500 hover:bg-blue-600 absolute right-10 bottom-10'
      onClick={() => {
        setOpenAddEditModal({isShown: true, type:"add", data: null});
      }}
      >
      <MdAdd className='text-[32px] text-white' />
     </button>

     <Modal
      isOpen={openAddEditModal.isShown}
      onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
        },
      }}
     contentLabel="Add/Edit Note"
     className="w-[90%] md:w-[50%] lg:w-[40%] max-h-[80vh] bg-white mx-auto mt-14 p-5 overflow-y-auto rounded-lg shadow-lg"
     >
     <AddEditNotes 
     type={openAddEditModal.type}
     noteData={openAddEditModal.data}
     onClose={() => {
      setOpenAddEditModal({ isShown: false, type: "add", data: null})
     }}
     getAllNotes={getAllNotes}
     showToastMessage={showToastMessage}
      />

    </Modal>
      <ToastMessage
      isShown={showToastMsg.isShown}
      message={showToastMsg.message}
      type={showToastMsg.type}
      onClose={handleCloseToast}

       />
     </>
    );
  };
  

export default Home