import { RESET } from 'jotai/utils'
import { atomWithHash } from 'jotai-location'
import { GridFeatureMode, GridFilterModel, GridSortModel } from '@mui/x-data-grid-pro'
import { useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export type PageState = { page: number, size: typeof PAGE_SIZE_OPTIONS[number] }

interface IState {
  pageState: PageState
  filterModel: GridFilterModel | undefined
  sortModel: GridSortModel
}


interface IDefaultProps {
  pagination: true
  paginationMode: GridFeatureMode,

  paginationModel: {
    page: number,
    pageSize: number,
  }
  onPaginationModelChange: (newModel: { page: number, pageSize: number }) => void

  pageSizeOptions: typeof PAGE_SIZE_OPTIONS
  sortModel: GridSortModel
  onSortModelChange: (newSortModel: GridSortModel) => void
  sortingMode: GridFeatureMode
}

interface IPropsWithFilter extends IDefaultProps {
  filterMode: GridFeatureMode
  filterModel: GridFilterModel | undefined
  onFilterModelChange: (model: GridFilterModel) => void
}

interface IReturnVal<T extends boolean> {
  page: number,
  size: number,
  filterModel: T extends true ? undefined : GridFilterModel | undefined,
  props: T extends true ? IDefaultProps : IPropsWithFilter,
  sortModel: GridSortModel
  setSortModel: (sortModel: GridSortModel) => void
}

type DefaultServerPagination = {
  sortModel?: GridSortModel
}

const undefinedOr = (val: any, fallback: any) => val === undefined ? fallback : val

export const useServerPagination = <T extends boolean>(
  name: string,
  noFilter?: T,
  defaults?: DefaultServerPagination,
): IReturnVal<T> => {
  const stateAtom = useMemo(() => atomWithHash<IState>(name, {
    pageState: { page: 0, size: 10 },
    filterModel: undefined,
    sortModel: undefinedOr(defaults?.sortModel, []),
  }), [])

  const [state, setState] = useAtom(stateAtom)

  useEffect(() => () => setState(RESET), [])

  let props: IDefaultProps | IPropsWithFilter = {
    pagination: true,
    paginationMode: 'server' as GridFeatureMode,

    paginationModel: {
      page: state.pageState.page,
      pageSize: state.pageState.size,
    },
    onPaginationModelChange: (newModel) => {
      setState(ps => ({
        ...ps,
        pageState: { size: newModel.pageSize, page: newModel.page },
      }))
    },

    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortModel: state.sortModel,
    onSortModelChange: (newSortModel) => setState(ps => ({ ...ps, sortModel: newSortModel })),
    sortingMode: 'server' as GridFeatureMode,
  }
  if (!noFilter) {
    props = {
      ...props,
      filterMode: 'server' as GridFeatureMode,
      filterModel: state.filterModel,
      onFilterModelChange: (model: GridFilterModel) => setState(ps => ({ ...ps, filterModel: model })),
    }
  }


  const setSortModel = (sortModel: GridSortModel) => {
    setState({ ...state, sortModel })
  }

  return {
    page: state.pageState.page,
    size: state.pageState.size,
    filterModel: !noFilter ? state.filterModel : undefined,
    sortModel: state.sortModel,
    setSortModel,
    props,
  } as any
}



