export const results = {
  overview: {
    report_url:
      "https://www.amazon.com/Under-Armour-Standard-Sportstyle-Short-Sleeve/dp/B08X3PBN8C/?_encoding=UTF8&pd_rd_w=6BNDU&content-id=amzn1.sym.e4bd6ac6-9035-4a04-92a6-fc4ad60e09ad&pf_rd_p=e4bd6ac6-9035-4a04-92a6-fc4ad60e09ad&pf_rd_r=PKE9T99RZHFXQ1TJ1G27&pd_rd_wg=hCqd2&pd_rd_r=b8a435be-b373-4699-9033-0c6fa88c184f&ref_=pd_gw_ci_mcx_mr_hp_atf_m",
    images: {
      main_url: "https://amazon.com/main.jpg",
      variant_urls: ["https://amazon.com/variant1.jpg", "https://amazon.com/variant2.jpg"]
    },
    marketplace: "amazon",
    product_name: "Under Armour Men's Boxed Sportstyle Short Sleeve T-shirt",
    rating: 4.5,
    reviewer_count: 10069,
    rating_count: 50014,
    price: {
      currency: "USD",
      symbol: "$",
      amount: 72.41,
      raw: "$48.65"
    }
  },
  listing_score: [
    {
      marketplace: "amazon",
      overall_score: 38,
      overall_score_change: 25,
      categories: [
        {
          category_id: "dimension",
          category_label: "Dimension",
          score: 12,
          score_change: 25
        },
        {
          category_id: "photography",
          category_label: "Photography",
          score: 17,
          score_change: 37
        }
      ],
      issues: {
        count: 27,
        improving_score: 67,
        critical_issues: [
          {
            id: "allowed_image_formats",
            label: "Allowed Image Formats"
          },
          {
            id: "min_image_size",
            label: "Minimum Image Dimension"
          }
        ],
        recommended_changes: [
          {
            id: "max_image_size",
            label: "Maximum Image Dimension"
          }
        ]
      },
      recommendations: {
        category_label: "Men's Fashion",
        sub_category_label: "Shoes",
        listing_examples: {
          length: 2,
          images: ["https://amazon.com/main.jpg", "https://amazon.com/variant.jpg"]
        }
      }
    }
  ],
  detailed_report: [
    {
      image: "URL",
      count: 1,
      data: [
        {
          category_id: "dimensions",
          category_label: "Dimensions",
          score_change: 24,
          tab_details: [
            {
              issue_id: "critical_issues",
              issue_label: "Critical Issues",
              details: [
                {
                  rule_id: "min_image_size",
                  rule_label: "Minimum Image Dimension",
                  potential_score: 24,
                  description: "The optimal zoom experience for detail pages requires files to be 1600px.",
                  how_to: "Here's our enhancing tool to bump up the resolution"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
