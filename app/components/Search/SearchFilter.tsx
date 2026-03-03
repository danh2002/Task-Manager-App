"use client";

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import toast from "react-hot-toast";

interface SearchFilterProps {
  onSearchResults?: (tasks: any[] | undefined) => void;
  boardId?: string;
  onTagsChanged?: () => void;
}

interface LabelItem {
  id: string;
  name: string;
  color: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ boardId, onTagsChanged }) => {
  const [showTags, setShowTags] = useState(false);
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#2b7fff");
  const [loading, setLoading] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  const [editingTagColor, setEditingTagColor] = useState("#2b7fff");
  const tagsRef = useRef<HTMLDivElement | null>(null);

  const fetchLabels = async () => {
    if (!boardId) return;
    try {
      const res = await axios.get(`/api/labels?boardId=${boardId}`);
      if (res.data.success) setLabels(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch labels:", error);
    }
  };

  useEffect(() => {
    if (showTags && boardId) {
      fetchLabels();
    }
  }, [showTags, boardId]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (tagsRef.current && !tagsRef.current.contains(event.target as Node)) {
        setShowTags(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleCreateTag = async () => {
    if (!boardId) {
      toast.error("Board is required to create tag");
      return;
    }
    const name = newTagName.trim();
    if (!name) {
      toast.error("Tag name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/labels", {
        name,
        color: newTagColor,
        boardId,
      });
      if (res.data.success) {
        setNewTagName("");
        setLabels((prev) => [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Tag created");
        onTagsChanged?.();
      } else {
        toast.error(res.data.error || "Failed to create tag");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (label: LabelItem) => {
    setEditingTagId(label.id);
    setEditingTagName(label.name);
    setEditingTagColor(label.color);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName("");
    setEditingTagColor("#2b7fff");
  };

  const handleUpdateTag = async () => {
    if (!editingTagId) return;
    const name = editingTagName.trim();
    if (!name) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const res = await axios.put("/api/labels", {
        id: editingTagId,
        name,
        color: editingTagColor,
      });
      if (res.data.success) {
        setLabels((prev) =>
          prev
            .map((label) => (label.id === editingTagId ? res.data.data : label))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success("Tag updated");
        onTagsChanged?.();
        handleCancelEdit();
      } else {
        toast.error(res.data.error || "Failed to update tag");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update tag");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await axios.delete(`/api/labels?id=${id}`);
      if (res.data.success) {
        setLabels((prev) => prev.filter((label) => label.id !== id));
        toast.success("Tag deleted");
        onTagsChanged?.();
        if (editingTagId === id) {
          handleCancelEdit();
        }
      } else {
        toast.error(res.data.error || "Failed to delete tag");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete tag");
    }
  };

  return (
    <FilterRow>
      <SearchBox>
        <i className="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="Search tasks..." />
      </SearchBox>

      <FilterChip>
        <i className="fa-regular fa-user"></i>
        Members
      </FilterChip>

      <TagsWrap ref={tagsRef}>
        <FilterChip type="button" onClick={() => setShowTags((prev) => !prev)}>
          <i className="fa-solid fa-tag"></i>
          Tags
        </FilterChip>

        {showTags && (
          <TagsPopover>
            <TagsTitle>Create New Tag</TagsTitle>
            <TagCreateRow>
              <TagNameInput
                type="text"
                placeholder="Tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <TagColorInput type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} />
              <TagCreateButton type="button" onClick={handleCreateTag} disabled={loading}>
                {loading ? "..." : "Create"}
              </TagCreateButton>
            </TagCreateRow>

            <TagsList>
              {labels.length === 0 ? (
                <TagEmpty>No tags yet</TagEmpty>
              ) : (
                labels.map((label) => (
                  <TagItem key={label.id}>
                    {editingTagId === label.id ? (
                      <TagEditRow>
                        <TagNameInput
                          type="text"
                          value={editingTagName}
                          onChange={(e) => setEditingTagName(e.target.value)}
                        />
                        <TagColorInput
                          type="color"
                          value={editingTagColor}
                          onChange={(e) => setEditingTagColor(e.target.value)}
                        />
                        <TagActionButton type="button" onClick={handleUpdateTag}>
                          Save
                        </TagActionButton>
                        <TagActionButton type="button" onClick={handleCancelEdit}>
                          Cancel
                        </TagActionButton>
                      </TagEditRow>
                    ) : (
                      <>
                        <TagBadge $color={label.color}>{label.name}</TagBadge>
                        <TagIconButton type="button" onClick={() => handleStartEdit(label)}>
                          <i className="fa-solid fa-pen"></i>
                        </TagIconButton>
                        <TagIconButton type="button" $danger onClick={() => handleDeleteTag(label.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </TagIconButton>
                      </>
                    )}
                  </TagItem>
                ))
              )}
            </TagsList>
          </TagsPopover>
        )}
      </TagsWrap>
    </FilterRow>
  );
};

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchBox = styled.label`
  width: 340px;
  max-width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #d9e2ef;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  color: #8ea1bc;

  input {
    flex: 1;
    color: #304665;
    font-size: 15px;
  }
`;

const FilterChip = styled.button`
  height: 32px;
  border-radius: 9px;
  border: 1px solid #d8e1ef;
  background: #ffffff;
  color: #5b7193;
  font-size: 14px;
  font-weight: 600;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 7px;
`;

const TagsWrap = styled.div`
  position: relative;
`;

const TagsPopover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 330px;
  border-radius: 12px;
  border: 1px solid #d7e2f1;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(20, 45, 82, 0.12);
  padding: 10px;
  z-index: 30;
`;

const TagsTitle = styled.p`
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #3d5475;
`;

const TagCreateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 42px auto;
  gap: 8px;
  margin-bottom: 10px;
`;

const TagNameInput = styled.input`
  height: 34px;
  border-radius: 10px;
  border: 1px solid #d6e1ef;
  padding: 0 10px;
  font-size: 13px;
  color: #1f2d44;
  background: #ffffff;

  &::placeholder {
    color: #8ca0bc;
  }

  &:focus {
    outline: none;
    border-color: #2b7fff;
    box-shadow: 0 0 0 3px rgba(43, 127, 255, 0.12);
  }
`;

const TagColorInput = styled.input`
  width: 42px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #d6e1ef;
  padding: 2px;
  background: #fff;
`;

const TagCreateButton = styled.button`
  height: 34px;
  border-radius: 10px;
  border: 1px solid #bed0e9;
  background: #f2f7ff;
  color: #3f628b;
  font-size: 12px;
  font-weight: 700;
  padding: 0 12px;
`;

const TagsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TagBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  height: 26px;
  border-radius: 999px;
  padding: 0 10px;
  border: 1px solid ${(props) => props.$color};
  color: ${(props) => props.$color};
  font-size: 12px;
  font-weight: 700;
  background: #fff;
`;

const TagIconButton = styled.button<{ $danger?: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$danger ? "#f3d2d2" : "#d6e1ef")};
  color: ${(props) => (props.$danger ? "#ef4444" : "#5f7496")};
  background: ${(props) => (props.$danger ? "#fff6f6" : "#ffffff")};
`;

const TagEditRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 42px auto auto;
  gap: 6px;
`;

const TagActionButton = styled.button`
  height: 34px;
  border-radius: 10px;
  border: 1px solid #d6e1ef;
  background: #ffffff;
  color: #4f6688;
  font-size: 12px;
  font-weight: 700;
  padding: 0 10px;
`;

const TagEmpty = styled.span`
  font-size: 12px;
  color: #7c90ad;
`;

export default SearchFilter;
