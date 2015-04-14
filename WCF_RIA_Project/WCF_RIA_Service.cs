using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ServiceModel.DomainServices.Server;
using System.Data.EntityClient;
using System.Data.Metadata.Edm;
using System.Data.Objects.DataClasses;
using System.Web.Configuration;
using LightSwitchApplication.Implementation;

namespace WCF_RIA_Project
{

    public class CombinedStadium
    {
        //private CombindeEcoStatus _ecoStatus;

        [Key]
        public int SiteId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public int? CateId { get; set; } 
        public string Owner { get; set; }
        public string Street { get; set; }
        public int? StreetId { get; set; }
        public string OrgCode { get; set; }
        public string Place { get; set; }
        public int? FoundYear { get; set; }
        public double? LandArea { get; set; }
        public double? BuildingArea { get; set; }
        public double? SiteArea { get; set; }
        public double? Investment { get; set; }
        public double? Fiscal { get; set; }
        public double? CommonWeal { get; set; }
        public double? SelfRaised { get; set; }
        public double? SocialDonate { get; set; }
        public double? Other { get; set; }
        public double? Longitude { get; set; }
        public double? Latitude { get; set; }
        public string Note { get; set; }
        public byte[] Photo { get; set; }

        [Include]
        [Association("Stadium_EcoStatus", "SiteId", "StadiumId")]
        public IQueryable<CombindeEcoStatus> EcoStatus { get; set; }
    }

    public class CombindeEcoStatus
    {
        //private CombinedStadium _combinedStadium;
        [Key]
        public int EcoId { get; set; }
        public string StatdiumName { get; set; }
        public int? StadiumId { get; set; }
        public int? Year { get; set; }
        public int? EmployeeNum { get; set; }
        public string OperateMode { get; set; }
        public string OpenStatus { get; set; }
        public double? OpeningDays { get; set; }
        public string ClientCount { get; set; }
        public double? Income { get; set; }
        public double? Expend { get; set; }

        [Include]
        [Association("Stadium_EcoStatus", "StadiumId", "SiteId", IsForeignKey = true)]
        public CombinedStadium Stadium
        {
            //get { return this._combinedStadium; }
            //set
            //{
            //    this._combinedStadium = value;
            //    if (value == null)
            //    {
            //        this.Id = value.Id;
            //    }
            //}
            get;
            set;
        }

    }

    public class WCF_RIA_Service : DomainService
    {
        private ApplicationData m_context;

        public ApplicationData Context
        {
            get
            {
                if (this.m_context == null)
                {
                    string connString =
                        System.Web.Configuration.WebConfigurationManager
                        .ConnectionStrings["_IntrinsicData"].ConnectionString;
                    EntityConnectionStringBuilder builder = new EntityConnectionStringBuilder();
                    builder.Metadata =
                        "res://*/ApplicationData.csdl|res://*/ApplicationData.ssdl|res://*/ApplicationData.msl";
                    builder.Provider =
                        "System.Data.SqlClient";
                    builder.ProviderConnectionString = connString;
                    this.m_context = new ApplicationData(builder.ConnectionString);
                }
                return this.m_context;
            }
        }

        [Query(IsDefault = true)]
        public IQueryable<CombinedStadium> GetAllStadiums()
        {
            var stadiumsQuery = from stadium in this.Context.StadiumSet
                                select new
                                {
                                    ID = stadium.Id,
                                    Name = stadium.Name,
                                    Category = stadium.Category.Name,
                                    CateID = stadium.Category.Id,
                                    OwnerParts = stadium.Owner2StadiumMediatorCollection.Select(x => x.Owner.Name),
                                    Street = stadium.Street.Name,
                                    StreetID= stadium.Street.Id,
                                    OrgCode = stadium.StadiumBase.OrgCode,
                                    Place = stadium.StadiumBase.Place,
                                    FoundYear = stadium.StadiumBase.FoundYear,
                                    LandArea = stadium.StadiumBase.LandArea,
                                    BuildingArea = stadium.StadiumBase.BuildingArea,
                                    SiteArea = stadium.StadiumBase.SiteArea,
                                    Investment = stadium.StadiumBase.Investment,
                                    Fiscal = stadium.StadiumBase.Fiscal,
                                    CommonWeal = stadium.StadiumBase.CommonWeal,
                                    SelfRaised = stadium.StadiumBase.SelfRaised,
                                    SocialDonate = stadium.StadiumBase.SocialDonate,
                                    Other = stadium.StadiumBase.Other,
                                    Longitude = stadium.StadiumBase.Longitude,
                                    Latitude = stadium.StadiumBase.Latitude,
                                    Note = stadium.StadiumBase.Note,
                                    Photo = stadium.StadiumBase.Photo,
                                };

            var result = stadiumsQuery.AsEnumerable().Select(x => new CombinedStadium()
            {
                SiteId = x.ID,
                Name = x.Name,
                Category = x.Category,
                CateId = x.CateID,
                Owner = string.Join("/", x.OwnerParts),
                Street = x.Street,
                StreetId = x.StreetID,
                OrgCode = x.OrgCode,
                Place = x.Place,
                FoundYear = x.FoundYear,
                LandArea = x.LandArea,
                BuildingArea = x.BuildingArea,
                SiteArea = x.SiteArea,
                Investment = x.Investment,
                Fiscal = x.Fiscal,
                CommonWeal = x.CommonWeal,
                SelfRaised = x.SelfRaised,
                Other = x.Other,
                Longitude = x.Longitude,
                Latitude = x.Latitude,
                Note = x.Note,
                Photo = x.Photo,
            }).AsQueryable();
            
            return result;
        }

        [Query(IsDefault = true)]
        public IQueryable<CombindeEcoStatus> GetAllEcoStatuses()
        {
            var stadiumEco = from eco in this.Context.EcoStatusSet
                             select new CombindeEcoStatus()
                             {
                                 EcoId = eco.Id,
                                 StatdiumName = eco.StadiumEco.Name,
                                 StadiumId = eco.StadiumEco.Id,
                                 Year = eco.Year,
                                 EmployeeNum = eco.Employee,
                                 OperateMode = eco.OperateMode,
                                 OpenStatus = eco.OpenStatus,
                                 OpeningDays = eco.OpeningDays,
                                 ClientCount = eco.ClientCount,
                                 Income = eco.Income,
                                 Expend = eco.Expend
                             };
            return stadiumEco;
        }

        protected override int Count<T>(IQueryable<T> queryable)
        {
            return queryable.Count();
        }

    }

}
