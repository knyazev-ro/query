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
      `${route('users.paginated')}?${params.toString()}`
    );

    return {
      options: data.data.map((e) => ({
        value: e.id,
        label: e?.last_name ?? '',
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
        <div className="cursor-pointer truncate text-sm text-white/90 transition hover:text-white">
          {data.author?.last_name ?? (
            <span className="text-gray-500">Добавить</span>
          )}
        </div>
      </Menu.Button>

      <Menu.Items className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#1c1c1c] shadow-lg backdrop-blur-xl">
        <Menu.Item>
          {({ close }) => (
            <AsyncPaginate
              noOptionsMessage={() => 'Нет опций'}
              loadingMessage={() => 'Загрузка'}
              placeholder="Поиск..."
              autoFocus
              defaultOptions
              loadOptions={loadResponsible}
              additional={{ page: 1 }}
              value={
                data?.author?.id
                  ? {
                      label: data?.author?.last_name,
                      value: data?.author?.id,
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
                control: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  minHeight: '36px',
                  fontSize: '0.9rem',
                  color: 'white',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#1c1c1c',
                  border: 'none',
                  boxShadow: 'none',
                }),
                menuList: (base) => ({
                  ...base,
                  padding: 4,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? 'rgba(255,255,255,0.05)'
                    : 'transparent',
                  color: '#e5e7eb',
                  cursor: 'pointer',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#e5e7eb',
                }),
                input: (base) => ({
                  ...base,
                  color: '#fff',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#6b7280',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: '#9ca3af',
                  padding: 4,
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
              }}
            />
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}