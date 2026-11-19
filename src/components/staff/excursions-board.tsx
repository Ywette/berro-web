import { ExcursionsBoardClient } from "@/components/staff/excursions-board-client";
import { listManagedExcursions } from "@/lib/data/managed-excursions";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function ExcursionsBoard() {
  const dictionary = await getDictionary();
  const labels = dictionary.staffDashboard;

  let excursions;
  try {
    excursions = await listManagedExcursions();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : labels.excursionsLoadError;
    return (
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-staff-danger" role="alert">
        {message}
      </p>
    );
  }

  return (
    <ExcursionsBoardClient
      excursions={excursions}
      labels={{
        boardTitle: labels.excursionsTitle,
        empty: labels.excursionsEmpty,
        add: labels.addExcursion,
        edit: labels.editExcursion,
        delete: labels.deleteExcursion,
        routeColumn: labels.excursionFormRoute,
        regionColumn: labels.excursionFormRegion,
        priceColumn: labels.excursionFormPrice,
        addTitle: labels.excursionFormAddTitle,
        editTitle: labels.excursionFormEditTitle,
        close: labels.excursionFormClose,
        save: labels.saveExcursion,
        saving: labels.savingExcursion,
        title: labels.excursionFormTitle,
        route: labels.excursionFormRoute,
        routeHint: labels.excursionFormRouteHint,
        teaser: labels.excursionFormTeaser,
        teaserHint: labels.excursionFormTeaserHint,
        details: labels.excursionFormDetails,
        detailsHint: labels.excursionFormDetailsHint,
        price: labels.excursionFormPrice,
        priceHint: labels.excursionFormPriceHint,
        duration: labels.excursionFormDuration,
        durationHint: labels.excursionFormDurationHint,
        registrationOpen: dictionary.excursions.registrationOpen.replace(/\s*:\s*$/, ""),
        plannedDate: dictionary.excursions.plannedDate,
        region: labels.excursionFormRegion,
        regionHint: labels.excursionFormRegionHint,
        regionLatvia: dictionary.excursions.filterLatvia,
        regionEstonia: dictionary.excursions.filterEstonia,
        regionLithuania: dictionary.excursions.filterLithuania,
        regionFrance: dictionary.excursions.filterFrance,
        regionBelgium: dictionary.excursions.filterBelgium,
        regionBaltics: dictionary.excursions.filterBaltics,
        regionGermany: dictionary.excursions.filterGermany,
        photos: labels.excursionFormPhotos,
        photosHint: labels.excursionFormPhotosHint,
        photoSize: labels.excursionFormPhotoSize,
        upload: labels.excursionFormUploadPhotos,
        moveUp: labels.excursionFormMovePhotoUp,
        moveDown: labels.excursionFormMovePhotoDown,
        moveLeft: labels.excursionFormMovePhotoLeft,
        moveRight: labels.excursionFormMovePhotoRight,
        preview: labels.excursionFormPreview,
        slot: labels.excursionFormSlot,
      }}
    />
  );
}
