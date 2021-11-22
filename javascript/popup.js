// SHOW MODAL 

const modalBody = document.querySelector("body");

const showModal = (openButton, modalContent) =>{
  const openBtn = document.getElementById(openButton),
  modalContainer = document.getElementById(modalContent)
  
  if(openBtn && modalContainer){
      openBtn.addEventListener('click', ()=>{
          modalBody.style.overflow = "hidden";
          modalContainer.classList.add('show-modal')
      })
  }
}
showModal('open-modal','modal-container')

// CLOSE MODAL
const closeBtn = document.querySelectorAll('.close-modal')

function closeModal(){
  const modalContainer = document.getElementById('modal-container')
  modalBody.style.overflow = "auto";
  modalContainer.classList.remove('show-modal')
}
closeBtn.forEach(c => c.addEventListener('click', closeModal))