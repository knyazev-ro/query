import { Menu } from '@headlessui/react';
import axios from 'axios';
import { Fragment } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';

async function fetchUsers(search, page = 1) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);

    const { data } = await axios.get(
      `${route('users.paginated')}?${params.toString()}`,
    );

    return {
      options: data.data.map((e) => ({
        value: e.id,
        label: (e?.last_name ?? ''),
        model: e,
      })),
      hasMore: data.next_page_url !== null,
      additional: {
        page: data.current_page + 1,
      },
    };
  } catch (error) {
    console.error('Ошибка загрузки responsible:', error);
    return { options: [], hasMore: false, additional: { page: 1 } };
  }
}

export default function PickManagerCell({ data, handleEditDeal }) {
  const Name = data?.manager?.last_name ?? '';
  const NameWidth = `calc(${Name.length}ch + 4ch)`;

  const loadResponsible = (search, loadedOptions, { page }) => {
    return fetchUsers(search, page);
  };

  const handleResponsibleChange = (selected) => {
    handleEditDeal({
      ...data,
      manager_id: selected?.value ?? null,
    });
  };

  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button as={Fragment}>
        <div className="flex items-center whitespace-nowrap cursor-pointer">
          {data.manager?.last_name ?? "Добавить"}
        </div>
      </Menu.Button>

      <Menu.Items className="absolute z-50 top-0 -m-0.5 w-44 bg-white shadow-sm">
        <Menu.Item>
          {({ close }) => (
            <AsyncPaginate
              noOptionsMessage={() => "Нет опций"}
              loadingMessage={() => "Загрузка"}
              placeholder={"Добавить"}
              defaultOptions
              className="text-xs w-full border-none"
              loadOptions={loadResponsible}
              additional={{ page: 1 }}
              value={
                data?.manager?.id
                  ? {
                      label: data?.manager?.last_name ?? '',
                      value: data?.manager?.id ?? null,
                    }
                  : null
              }
              onChange={(e) => {
                if (e) {
                  handleResponsibleChange(e);
                  close();
                }
              }}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '20px',
                  height: '25px',
                  fontSize: '0.9rem',
                  padding: 2,
                  backgroundColor: 'transparent',
                  boxShadow: 'none !important',
                  outline: 'none !important',
                  borderColor: state.isFocused ? '#d1d5db' : base.borderColor,
                  '&:hover': {
                    borderColor: '#d1d5db',
                  },
                  width: NameWidth, // подгоняем по содержимому
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: 0,
                  margin: 0,
                  alignItems: 'flex-start',
                  height: '20px',
                  backgroundColor: 'transparent',
                }),
                singleValue: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: '20px',
                  padding: 0,
                  backgroundColor: 'transparent',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 4px',
                  backgroundColor: 'transparent',
                }),
                clearIndicator: (base) => ({
                  ...base,
                  padding: '0 4px',
                  backgroundColor: 'transparent',
                }),
              }}
            />
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}