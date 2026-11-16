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
      <p className="rounded-2xl bg-burgundy/15 px-5 py-4 text-sm text-rose-200" role="alert">
        {message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-medium text-ivory">{labels.excursionsTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">{labels.excursionsBody}</p>
      </div>
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
          region: labels.excursionFormRegion,
          regionHint: labels.excursionFormRegionHint,
          regionLatvia: dictionary.excursions.filterLatvia,
          regionEstonia: dictionary.excursions.filterEstonia,
          regionLithuania: dictionary.excursions.filterLithuania,
          regionFrance: dictionary.excursions.filterFrance,
          regionBaltics: dictionary.excursions.filterBaltics,
          regionGermany: dictionary.excursions.filterGermany,
          photos: labels.excursionFormPhotos,
          photosHint: labels.excursionFormPhotosHint,
          photoSize: labels.excursionFormPhotoSize,
          upload: labels.excursionFormUploadPhotos,
          moveLeft: labels.excursionFormMovePhotoLeft,
          moveRight: labels.excursionFormMovePhotoRight,
          remove: labels.excursionFormRemovePhoto,
          logo: labels.excursionFormLogo,
          logoHint: labels.excursionFormLogoHint,
          logoDark: labels.excursionFormLogoDark,
          logoWhite: labels.excursionFormLogoWhite,
          preview: labels.excursionFormPreview,
          slot: labels.excursionFormSlot,
        }}
      />
    </div>
  );
}
