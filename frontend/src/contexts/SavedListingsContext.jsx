import { createContext, useContext, useEffect, useState } from "react";
import { getSavedListingIds, saveListing, removeSavedListing } from "../services/savedListingApi";
import { useAuth } from "./AuthContext";

const SavedListingsContext = createContext();

export function SavedListingsProvider({ children }) {
  const { currentUser } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setSavedIds(new Set());
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      try {
        const res = await getSavedListingIds();
        const ids = res?.data || [];
        setSavedIds(new Set(ids.map((id) => String(id))));
      } catch (err) {
        console.error("Error fetching saved listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [currentUser]);

  const addSaved = async (listingId) => {
    await saveListing({ listingId });
    setSavedIds((prev) => new Set(prev).add(String(listingId)));
  };

  const removeSaved = async (listingId) => {
    await removeSavedListing(listingId);
    setSavedIds((prev) => {
      const updated = new Set(prev);
      updated.delete(String(listingId));
      return updated;
    });
  };

  const toggleSaved = async (listingId) => {
    if (savedIds.has(String(listingId))) {
      await removeSaved(listingId);
    } else {
      await addSaved(listingId);
    }
  };

  return (
    <SavedListingsContext.Provider
      value={{
        savedIds,
        loading,
        addSaved,
        removeSaved,
        toggleSaved,
        isSaved: (id) => savedIds.has(String(id)),
      }}
    >
      {children}
    </SavedListingsContext.Provider>
  );
}

export const useSavedListings = () => useContext(SavedListingsContext);
