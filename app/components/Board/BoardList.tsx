"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import BoardForm from "../Forms/BoardForm";
import Modal from "../Modals/Modal";
import { useRouter } from "next/navigation";

interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  columns?: any[];
  _count?: {
    tasks: number;
  };
}

// Modern BoardList Container - Updated with new design
const BoardListContainer = styled.div`
  width: 100%;
  padding: 24px;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0px 10px 15px -3px rgba(19, 127, 236, 0.1), 0px 4px 6px -4px rgba(19, 127, 236, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.5px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #137FEC;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0px 10px 15px -3px rgba(19, 127, 236, 0.2), 0px 4px 6px -4px rgba(19, 127, 236, 0.2);
  font-family: 'Inter', sans-serif;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0px 10px 15px -3px rgba(19, 127, 236, 0.3), 0px 4px 6px -4px rgba(19, 127, 236, 0.3);
  }

  i {
    font-size: 14px;
  }
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const BoardCard = styled.div<{ $boardColor: string }>`
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  box-shadow: 0px 10px 15px -3px rgba(19, 127, 236, 0.1), 0px 4px 6px -4px rgba(19, 127, 236, 0.1);
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.$boardColor || '#137FEC'};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 10px 15px -3px rgba(19, 127, 236, 0.2), 0px 4px 6px -4px rgba(19, 127, 236, 0.2);
    border-color: #137FEC;
  }
`;

const BoardCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BoardColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.$color};
`;

const BoardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  @media (prefers-color-scheme: dark) {
    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  }
`;

const BoardName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.5px;
`;

const BoardDescription = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0 0 20px 0;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
`;

const BoardStats = styled.div`
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94A3B8;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  
  i {
    font-size: 14px;
    color: #137FEC;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  
  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-color: #374151;
  }
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
  
  @media (prefers-color-scheme: dark) {
    color: #4b5563;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  
  @media (prefers-color-scheme: dark) {
    color: #f3f4f6;
  }
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  
  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const DeleteConfirmOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteConfirmModal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  
  @media (prefers-color-scheme: dark) {
    background: #1f2937;
  }
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (prefers-color-scheme: dark) {
    color: #f3f4f6;
  }
`;

const ModalContentText = styled.p`
  color: #6b7280;
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  
  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const ModalContentBold = styled.p`
  color: #111827;
  margin: 0 0 20px 0;
  font-size: 15px;
  font-weight: 600;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  
  @media (prefers-color-scheme: dark) {
    color: #f3f4f6;
    background: #374151;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const CancelBtn = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;

  @media (prefers-color-scheme: dark) {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }

  &:hover {
    background: #f3f4f6;
  }
`;

const DeleteBtn = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  background: #ef4444;
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }
`;

const BoardList: React.FC = () => {
  const { theme, boards, allBoards, openModal, modal, deleteBoard } = useGlobalState();
  const router = useRouter();
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    allBoards();
  }, []);

  const handleBoardClick = (boardId: string) => {
    setSelectedBoard(boardId);
    router.push(`/board/${boardId}`);
  };

  const handleDeleteBoardClick = (e: React.MouseEvent, boardId: string, boardName: string) => {
    e.stopPropagation();
    setBoardToDelete({ id: boardId, name: boardName });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteBoard = async () => {
    if (boardToDelete) {
      setIsDeleting(true);
      await deleteBoard(boardToDelete.id);
      setShowDeleteConfirm(false);
      setBoardToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCreateBoard = () => {
    openModal();
  };

  return (
    <BoardListContainer>
      {modal && (
        <Modal 
          content={
            <BoardForm 
              onSuccess={() => allBoards()} 
            />
          } 
        />
      )}
       
      <Header>
        <Title>My Boards</Title>
        <CreateButton onClick={handleCreateBoard}>
          <i className="fa-solid fa-plus"></i>
          Create Board
        </CreateButton>
      </Header>

      <BoardsGrid>
        {boards && boards.length > 0 ? (
          boards.map((board: Board) => (
            <BoardCard 
              key={board.id} 
              $boardColor={board.color}
              onClick={() => handleBoardClick(board.id)}
            >
              <BoardCardHeader>
                <BoardColorDot $color={board.color} />
                <BoardActions>
                  <ActionButton 
                    onClick={(e) => handleDeleteBoardClick(e, board.id, board.name)}
                    title="Delete Board"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </ActionButton>
                </BoardActions>
              </BoardCardHeader>
              <BoardName>{board.name}</BoardName>
              {board.description && (
                <BoardDescription>{board.description}</BoardDescription>
              )}
              <BoardStats>
                <Stat>
                  <i className="fa-solid fa-columns"></i>
                  {board.columns?.length || 0} columns
                </Stat>
                <Stat>
                  <i className="fa-solid fa-list-check"></i>
                  {board._count?.tasks || 0} tasks
                </Stat>
              </BoardStats>
            </BoardCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>
              <i className="fa-solid fa-clipboard-list"></i>
            </EmptyIcon>
            <EmptyTitle>No boards yet</EmptyTitle>
            <EmptyText>Create your first board to get started!</EmptyText>
            <CreateButton onClick={handleCreateBoard}>
              <i className="fa-solid fa-plus"></i>
              Create Board
            </CreateButton>
          </EmptyState>
        )}
      </BoardsGrid>

      {showDeleteConfirm && (
        <DeleteConfirmOverlay onClick={() => setShowDeleteConfirm(false)}>
          <DeleteConfirmModal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Board</ModalTitle>
            <ModalContentText>Are you sure you want to delete this board?</ModalContentText>
            <ModalContentBold>"{boardToDelete?.name}"</ModalContentBold>
            <ModalContentText>All columns and tasks in this board will also be deleted.</ModalContentText>
            <ModalActions>
              <CancelBtn onClick={() => setShowDeleteConfirm(false)}>Cancel</CancelBtn>
              <DeleteBtn onClick={handleConfirmDeleteBoard} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </DeleteBtn>
            </ModalActions>
          </DeleteConfirmModal>
        </DeleteConfirmOverlay>
      )}
    </BoardListContainer>
  );
};

export default BoardList;