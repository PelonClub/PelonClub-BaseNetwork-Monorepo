import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TOKENOMICS_DATA, getBaseScanUrl } from '@/data/tokenomics';
import Link from 'next/link';

export default function TokenomicsTable() {
  const t = useTranslations('tokenomics.table');

  return (
    <div
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6',
        'rounded-none',
        'overflow-x-auto'
      )}
    >
      <h3
        className={cn(
          'text-2xl sm:text-3xl',
          'font-bold',
          'text-foreground',
          'mb-6',
          'flex items-center gap-3'
        )}
      >
        <span>📋</span>
        <span>{t('title')}</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-[3px] border-black">
              <th className="text-left p-4 text-foreground font-bold text-sm sm:text-base border-r-[3px] border-black">
                {t('category')}
              </th>
              <th className="text-left p-4 text-foreground font-bold text-sm sm:text-base border-r-[3px] border-black">
                {t('subcategory')}
              </th>
              <th className="text-right p-4 text-foreground font-bold text-sm sm:text-base border-r-[3px] border-black">
                {t('percentage')}
              </th>
              <th className="text-right p-4 text-foreground font-bold text-sm sm:text-base border-r-[3px] border-black">
                {t('tokens')}
              </th>
              <th className="text-left p-4 text-foreground font-bold text-sm sm:text-base">
                {t('wallet')}
              </th>
            </tr>
          </thead>
          <tbody>
            {TOKENOMICS_DATA.map((category, categoryIndex) => {
              const isLastCategory = categoryIndex === TOKENOMICS_DATA.length - 1;
              return (
                <React.Fragment key={category.name}>
                  <tr>
                    <td
                      className={cn(
                        'p-4 text-foreground font-bold text-sm sm:text-base border-r-[3px] border-black',
                        'border-b-[2px] border-black',
                        categoryIndex === 0 && 'bg-primary/10'
                      )}
                      rowSpan={category.subcategories.length + 1}
                    >
                      {category.name}
                    </td>
                    <td
                      className={cn(
                        'p-4 text-foreground font-medium text-sm border-r-[3px] border-black',
                        'border-b-[2px] border-black'
                      )}
                    >
                      <span className="font-bold">{t('total')}</span>
                    </td>
                    <td
                      className={cn(
                        'p-4 text-foreground font-bold text-sm sm:text-base text-right border-r-[3px] border-black',
                        'border-b-[2px] border-black',
                        'text-primary'
                      )}
                    >
                      {category.percentage}%
                    </td>
                    <td
                      className={cn(
                        'p-4 text-foreground font-bold text-sm sm:text-base text-right border-r-[3px] border-black',
                        'border-b-[2px] border-black'
                      )}
                    >
                      {category.tokens}B
                    </td>
                    <td
                      className={cn(
                        'p-4 border-b-[2px] border-black'
                      )}
                    >
                      {category.walletAddress.startsWith('0x') ? (
                        <Link
                          href={getBaseScanUrl(category.walletAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover font-medium text-xs sm:text-sm break-all underline"
                        >
                          {category.walletAddress}
                        </Link>
                      ) : (
                        <span className="text-foreground font-medium text-xs sm:text-sm break-all">
                          {category.walletAddress}
                        </span>
                      )}
                    </td>
                  </tr>
                  {category.subcategories.map((subcategory, subIndex) => {
                    const isLastSubcategory = subIndex === category.subcategories.length - 1;
                    const isLastRow = isLastCategory && isLastSubcategory;
                    return (
                      <tr key={`${category.name}-${subcategory.name}`}>
                        <td
                          className={cn(
                            'p-4 text-muted-foreground text-sm border-r-[3px] border-black',
                            isLastRow ? 'border-b-[3px]' : 'border-b-[2px]',
                            'border-black'
                          )}
                        >
                          {subcategory.name}
                        </td>
                        <td
                          className={cn(
                            'p-4 text-foreground font-medium text-sm sm:text-base text-right border-r-[3px] border-black',
                            isLastRow ? 'border-b-[3px]' : 'border-b-[2px]',
                            'border-black'
                          )}
                        >
                          {subcategory.percentage}%
                        </td>
                        <td
                          className={cn(
                            'p-4 text-foreground font-medium text-sm sm:text-base text-right border-r-[3px] border-black',
                            isLastRow ? 'border-b-[3px]' : 'border-b-[2px]',
                            'border-black'
                          )}
                        >
                          {subcategory.tokens}B
                        </td>
                        <td
                          className={cn(
                            isLastRow ? 'border-b-[3px]' : 'border-b-[2px]',
                            'border-black',
                            'p-4'
                          )}
                        >
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

