import React, { FC, memo, useState } from 'react'
import { PaginationResponse, Task } from '@tasks/client'
import { DataGridPro, GridRowId } from '@mui/x-data-grid-pro'
import { atomWithDefault } from 'jotai/utils'
import { useAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { useServerPagination } from '../../../hooks/useServerSide'
import api from '../../../services/api'
import { filterModelToPrismaWhere, sortToPrismaSort } from "../../../utils/prisma";
import useApiOnLoad from "../../../hooks/useApiOnLoad";
import { AppPage } from "../../../components/containers/AppPage";
import { noBorderGrid } from "../../../utils/styles";
import BasicToolbar from "../../../components/table/BasicToolbar";
import { tableColumns } from "./homeTableColumns";
import TaskPanelContent from "../../../components/table/TaskPanelContent";

const rowsAtom = atomWithDefault<PaginationResponse<Task> | null>(() => null)

const Home: FC = () => {
  const {
    page,
    size,
    filterModel,
    sortModel,
    setSortModel,
    props: pageAndFilterProps,
  } = useServerPagination('home', false, {
    sortModel: [
      {
        field: 'createdAt',
        sort: 'desc',
      },
    ],
  })
  const [tasks, setTasks] = useAtom(rowsAtom)

  const findTasks = () =>
    api.manager.find({
      skip: page * size,
      take: size,
      where: filterModelToPrismaWhere(filterModel || { items: [] }) || {},
      orderBy: sortToPrismaSort(sortModel),
    })
  const { isLoading, reload } = useApiOnLoad(findTasks, setTasks, [page, size, filterModel, sortModel])

  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<GridRowId[]>([])

  return (
    <AppPage>
      <DataGridPro
        sx={{
          width: '100%',
          ...noBorderGrid,
        }}
        slots={{
          toolbar: () => <BasicToolbar reload={reload} />,
        }}
        loading={isLoading}
        columns={tableColumns}
        rows={tasks?.data || []}
        rowCount={tasks?.total || 0}
        {...pageAndFilterProps}
        getDetailPanelContent={({ row }) => (
          <TaskPanelContent
            taskAtom={
              focusAtom(rowsAtom, (optic) =>
                optic
                  .optional()
                  .path('data')
                  .find(((v: Task) => v.id === row.id) as any),
              ) as any
            }
          />
        )}
        getDetailPanelHeight={() => 'auto'} // Height based on the content.
        detailPanelExpandedRowIds={detailPanelExpandedRowIds}
        onDetailPanelExpandedRowIdsChange={setDetailPanelExpandedRowIds}
        // expand row on click
        onRowClick={(e) => {
          const id = e.row.id
          setDetailPanelExpandedRowIds((ps) => (ps.includes(id) ? ps.filter((v) => v !== id) : [...ps, id]))
        }}
      />
    </AppPage>
  )
}

export default memo(Home)
