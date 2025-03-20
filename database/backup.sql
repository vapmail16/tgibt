--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: vikkasarunpareek
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO vikkasarunpareek;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: vikkasarunpareek
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(255),
    isbn character varying(13),
    price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


ALTER TABLE public.books OWNER TO vikkasarunpareek;

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: vikkasarunpareek
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.books_id_seq OWNER TO vikkasarunpareek;

--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikkasarunpareek
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: sales_data; Type: TABLE; Schema: public; Owner: vikkasarunpareek
--

CREATE TABLE public.sales_data (
    id integer NOT NULL,
    book_id integer,
    user_id integer,
    event_name character varying(255),
    month date NOT NULL,
    quantity integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    redeemed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sales_amount numeric(10,2) DEFAULT 50.00
);


ALTER TABLE public.sales_data OWNER TO vikkasarunpareek;

--
-- Name: sales_data_id_seq; Type: SEQUENCE; Schema: public; Owner: vikkasarunpareek
--

CREATE SEQUENCE public.sales_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sales_data_id_seq OWNER TO vikkasarunpareek;

--
-- Name: sales_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikkasarunpareek
--

ALTER SEQUENCE public.sales_data_id_seq OWNED BY public.sales_data.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: vikkasarunpareek
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    mobile_number character varying(20),
    address text
);


ALTER TABLE public.users OWNER TO vikkasarunpareek;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: vikkasarunpareek
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO vikkasarunpareek;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vikkasarunpareek
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: sales_data id; Type: DEFAULT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.sales_data ALTER COLUMN id SET DEFAULT nextval('public.sales_data_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: vikkasarunpareek
--

COPY public.books (id, title, author, isbn, price, created_at, updated_at, user_id) FROM stdin;
2	Blue 2	Neeru Pareek	234	99.00	2025-03-18 20:07:36.968482	2025-03-20 04:44:48.395056	4
1	Blue 1	Vikkas Arun Pareek	123	99.00	2025-03-18 20:07:36.968482	2025-03-20 04:44:48.395056	1
3	Voices	Miraya Pareek	345	199.00	2025-03-18 20:07:36.968482	2025-03-20 04:44:48.395056	5
4	Mr. Joshi’s Bride	Vani Kaushal	939548196X	350.00	2025-03-20 05:37:02.599474	2025-03-20 05:37:02.599474	6
\.


--
-- Data for Name: sales_data; Type: TABLE DATA; Schema: public; Owner: vikkasarunpareek
--

COPY public.sales_data (id, book_id, user_id, event_name, month, quantity, amount, redeemed, created_at, updated_at, sales_amount) FROM stdin;
1	1	4	Christmas	2024-12-01	2	198.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
2	1	4	Holi	2025-02-01	5	495.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
3	1	4	Diwali	2024-10-01	3	297.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
4	2	4	Christmas	2024-12-01	10	990.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
5	2	4	Holi	2025-02-01	5	495.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
6	2	4	Diwali	2024-10-01	20	1980.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
7	2	4	New Year	2024-12-01	1	99.00	t	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
8	3	5	Christmas	2024-12-01	5	995.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
9	3	5	Holi	2025-02-01	8	1592.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
10	3	5	Diwali	2024-10-01	2	398.00	f	2025-03-18 20:07:36.968482	2025-03-19 19:46:03.402588	50.00
11	3	1	Holi	2024-03-01	10	1990.00	f	2025-03-18 20:58:03.434741	2025-03-20 04:32:13.716449	50.00
12	3	1	Online Event	2025-01-01	10	1990.00	f	2025-03-18 20:58:03.434741	2025-03-20 04:32:13.716449	50.00
13	3	1	Jaipur Event	2025-02-01	10	1990.00	f	2025-03-18 20:58:03.434741	2025-03-20 04:32:13.716449	50.00
14	3	1	Holi	2024-03-01	10	1990.00	f	2025-03-18 20:58:24.33338	2025-03-20 04:32:13.716449	50.00
15	3	1	Online Event	2025-01-01	10	1990.00	f	2025-03-18 20:58:24.33338	2025-03-20 04:32:13.716449	50.00
16	3	1	Jaipur Event	2025-02-01	10	1990.00	f	2025-03-18 20:58:24.33338	2025-03-20 04:47:15.930145	50.00
17	4	6	Holi	2024-03-01	5	250.00	f	2025-03-20 06:25:21.232496	2025-03-20 06:25:21.232496	50.00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vikkasarunpareek
--

COPY public.users (id, email, password_hash, name, role, created_at, updated_at, mobile_number, address) FROM stdin;
1	vapmail16@gmail.com	$2b$10$4u3KOqSD.SNh/54k44.TFuh78p7ldEjdCeSbb6ymX58VlVcA.CjtC	Admin User	admin	2025-03-18 19:33:09.178689	2025-03-18 19:33:09.178689	\N	\N
4	vapbooksfeedback@gmail.com	$2b$10$hhP/YoTNZxzTruJm2EeNY.Uha.Wgr1U9Yh4PfTyd5mQGoQtcTwTNm	Neeru	user	2025-03-19 19:41:14.452001	2025-03-19 19:52:55.869463	\N	\N
5	occultdiy@gmail.com	$2b$10$eALHmXs9xc.8oX9EWCyAQuH563fw33IAtNEl1TPbxMDPRkBAESdOq	Miraya	user	2025-03-19 19:41:14.452001	2025-03-20 05:03:20.368434	\N	\N
6	vapphotoalbum1@gmail.com	$2b$10$hvg1HEdJC1uG1Xx4jaamW.DTfEZSAwz1AmHf1rOLOCCxQvYkSc5qq	Vani Kaushal	user	2025-03-20 05:37:02.599474	2025-03-20 05:37:02.599474	\N	\N
\.


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikkasarunpareek
--

SELECT pg_catalog.setval('public.books_id_seq', 4, true);


--
-- Name: sales_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikkasarunpareek
--

SELECT pg_catalog.setval('public.sales_data_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: vikkasarunpareek
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: sales_data sales_data_pkey; Type: CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.sales_data
    ADD CONSTRAINT sales_data_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_sales_data_book_id; Type: INDEX; Schema: public; Owner: vikkasarunpareek
--

CREATE INDEX idx_sales_data_book_id ON public.sales_data USING btree (book_id);


--
-- Name: idx_sales_data_month; Type: INDEX; Schema: public; Owner: vikkasarunpareek
--

CREATE INDEX idx_sales_data_month ON public.sales_data USING btree (month);


--
-- Name: idx_sales_data_user_id; Type: INDEX; Schema: public; Owner: vikkasarunpareek
--

CREATE INDEX idx_sales_data_user_id ON public.sales_data USING btree (user_id);


--
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: vikkasarunpareek
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales_data update_sales_data_updated_at; Type: TRIGGER; Schema: public; Owner: vikkasarunpareek
--

CREATE TRIGGER update_sales_data_updated_at BEFORE UPDATE ON public.sales_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: vikkasarunpareek
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: books books_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sales_data sales_data_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.sales_data
    ADD CONSTRAINT sales_data_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: sales_data sales_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vikkasarunpareek
--

ALTER TABLE ONLY public.sales_data
    ADD CONSTRAINT sales_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: TABLE books; Type: ACL; Schema: public; Owner: vikkasarunpareek
--

GRANT ALL ON TABLE public.books TO tgibt_user;


--
-- Name: SEQUENCE books_id_seq; Type: ACL; Schema: public; Owner: vikkasarunpareek
--

GRANT ALL ON SEQUENCE public.books_id_seq TO tgibt_user;


--
-- Name: TABLE sales_data; Type: ACL; Schema: public; Owner: vikkasarunpareek
--

GRANT ALL ON TABLE public.sales_data TO tgibt_user;


--
-- Name: SEQUENCE sales_data_id_seq; Type: ACL; Schema: public; Owner: vikkasarunpareek
--

GRANT ALL ON SEQUENCE public.sales_data_id_seq TO tgibt_user;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: vikkasarunpareek
--

GRANT ALL ON TABLE public.users TO tgibt_user;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: vikkasarunpareek
--

GRANT ALL ON SEQUENCE public.users_id_seq TO tgibt_user;


--
-- PostgreSQL database dump complete
--

